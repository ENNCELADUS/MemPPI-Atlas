#!/usr/bin/env node
/**
 * Validate edges CSV against nodes CSV to diagnose import issues.
 * - Counts total edges
 * - Counts duplicate edge IDs
 * - Counts edges referencing proteins not present in nodes
 * - Reports sample problematic rows
 *
 * Run: node scripts/validate-edges.js
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'supabase-import');
const NODES_CSV = path.join(DATA_DIR, 'nodes.csv');
const EDGES_CSV = path.join(DATA_DIR, 'edges.csv');

function parseCsvLine(line) {
  // Minimal CSV parser: handles quoted fields and commas inside quotes
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      // Toggle quotes or escape double quote inside quotes
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function stripQuotes(s) {
  if (s.length >= 2 && s.startsWith('"') && s.endsWith('"')) return s.slice(1, -1);
  return s;
}

function loadNodeSet(nodesCsvPath) {
  const content = fs.readFileSync(nodesCsvPath, 'utf8');
  const lines = content.split(/\r?\n/).filter(Boolean);
  const header = parseCsvLine(lines[0]);
  const proteinIdx = header.findIndex((h) => stripQuotes(h) === 'protein');
  if (proteinIdx === -1) throw new Error('protein column not found in nodes.csv');
  const nodeSet = new Set();
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length === 0) continue;
    const protein = stripQuotes(cols[proteinIdx]);
    if (protein) nodeSet.add(protein);
  }
  return nodeSet;
}

function analyzeEdges(edgesCsvPath, nodeSet) {
  const content = fs.readFileSync(edgesCsvPath, 'utf8');
  const lines = content.split(/\r?\n/).filter(Boolean);
  const header = parseCsvLine(lines[0]);
  const indexOf = (name) => header.findIndex((h) => stripQuotes(h) === name);
  const idxEdge = indexOf('edge');
  const idxP1 = indexOf('protein1');
  const idxP2 = indexOf('protein2');
  const idxProb = indexOf('fusion_pred_prob');
  const idxTissue = indexOf('enriched_tissue');
  const idxConf = indexOf('tissue_enriched_confidence');

  const seenEdges = new Set();
  const duplicates = new Set();
  let missingProteinCount = 0;
  let invalidRows = 0;
  const missingProteinSamples = [];
  const duplicateSamples = [];
  let emptyEdgeIdCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length < 7) {
      invalidRows++;
      continue;
    }
    const edge = stripQuotes(cols[idxEdge]);
    const p1 = stripQuotes(cols[idxP1]);
    const p2 = stripQuotes(cols[idxP2]);
    const prob = cols[idxProb];
    const tissue = stripQuotes(cols[idxTissue]);
    const conf = stripQuotes(cols[idxConf]);

    if (!edge) emptyEdgeIdCount++;

    if (seenEdges.has(edge)) {
      duplicates.add(edge);
      if (duplicateSamples.length < 5) duplicateSamples.push({ edge, p1, p2 });
    } else {
      seenEdges.add(edge);
    }

    if (!nodeSet.has(p1) || !nodeSet.has(p2)) {
      missingProteinCount++;
      if (missingProteinSamples.length < 5) {
        missingProteinSamples.push({ edge, p1, p2, missing: { p1: !nodeSet.has(p1), p2: !nodeSet.has(p2) } });
      }
    }
  }

  return {
    totalLines: lines.length, // includes header
    dataRows: lines.length - 1,
    uniqueEdges: seenEdges.size,
    duplicateEdgeCount: duplicates.size,
    duplicateSamples,
    missingProteinCount,
    missingProteinSamples,
    invalidRows,
    emptyEdgeIdCount,
  };
}

(function main() {
  console.log('Validating edges against nodes...');
  if (!fs.existsSync(NODES_CSV) || !fs.existsSync(EDGES_CSV)) {
    console.error('Expected CSV files not found in data/supabase-import/. Run prepare-csvs-for-import.js first.');
    process.exit(1);
  }

  const nodeSet = loadNodeSet(NODES_CSV);
  console.log(`Loaded nodes: ${nodeSet.size}`);

  const report = analyzeEdges(EDGES_CSV, nodeSet);
  console.log('\n--- Report ---');
  console.log(`Total edge CSV lines (incl header): ${report.totalLines}`);
  console.log(`Data rows: ${report.dataRows}`);
  console.log(`Unique edge IDs: ${report.uniqueEdges}`);
  console.log(`Duplicate edge IDs: ${report.duplicateEdgeCount}`);
  console.log(`Invalid/short rows: ${report.invalidRows}`);
  console.log(`Empty edge IDs: ${report.emptyEdgeIdCount}`);
  console.log(`Edges referencing missing proteins: ${report.missingProteinCount}`);

  if (report.duplicateSamples.length) {
    console.log('\nDuplicate samples (first 5):');
    for (const s of report.duplicateSamples) console.log(s);
  }
  if (report.missingProteinSamples.length) {
    console.log('\nMissing protein samples (first 5):');
    for (const s of report.missingProteinSamples) console.log(s);
  }
})();


