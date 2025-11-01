#!/usr/bin/env node
/**
 * Augments nodes.csv by adding any proteins referenced in edges.csv
 * that are not present in nodes.csv.
 *
 * - Backs up nodes.csv to nodes.csv.bak
 * - Appends minimal rows for missing proteins with empty metadata fields
 *
 * Run: node scripts/augment-nodes-from-edges.js
 */

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data", "supabase-import");
const NODES_CSV = path.join(DATA_DIR, "nodes.csv");
const EDGES_CSV = path.join(DATA_DIR, "edges.csv");

function parseCsvLine(line) {
  // Minimal CSV parser supporting quotes and commas inside quotes
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function stripQuotes(s) {
  if (!s) return s;
  if (s.length >= 2 && s.startsWith('"') && s.endsWith('"'))
    return s.slice(1, -1);
  return s;
}

function loadNodes(nodesCsvPath) {
  const content = fs.readFileSync(nodesCsvPath, "utf8");
  const lines = content.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) throw new Error("nodes.csv is empty");
  const header = parseCsvLine(lines[0]).map(stripQuotes);
  const expected = [
    "protein",
    "entry_name",
    "description",
    "gene_names",
    "family",
    "expression_tissue",
  ];
  if (expected.join("|") !== header.join("|")) {
    throw new Error(
      `nodes.csv header mismatch. Found: ${header.join(
        ","
      )} Expected: ${expected.join(",")}`
    );
  }
  const nodeSet = new Set();
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (!cols.length) continue;
    const protein = stripQuotes(cols[0]);
    if (protein) nodeSet.add(protein);
  }
  return { lines, nodeSet };
}

function computeMissingProteins(edgesCsvPath, nodeSet) {
  const content = fs.readFileSync(edgesCsvPath, "utf8");
  const lines = content.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) throw new Error("edges.csv is empty");
  const header = parseCsvLine(lines[0]).map(stripQuotes);
  const idxP1 = header.indexOf("protein1");
  const idxP2 = header.indexOf("protein2");
  if (idxP1 === -1 || idxP2 === -1)
    throw new Error("edges.csv missing protein1/protein2 columns");
  const missing = new Set();
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]).map(stripQuotes);
    if (cols.length === 0) continue;
    const p1 = cols[idxP1];
    const p2 = cols[idxP2];
    if (p1 && !nodeSet.has(p1)) missing.add(p1);
    if (p2 && !nodeSet.has(p2)) missing.add(p2);
  }
  return missing;
}

function main() {
  if (!fs.existsSync(NODES_CSV))
    throw new Error(`nodes.csv not found at ${NODES_CSV}`);
  if (!fs.existsSync(EDGES_CSV))
    throw new Error(`edges.csv not found at ${EDGES_CSV}`);

  const { lines: nodeLines, nodeSet } = loadNodes(NODES_CSV);
  const missing = computeMissingProteins(EDGES_CSV, nodeSet);

  const toAppend = [...missing].filter((p) => !nodeSet.has(p));
  console.log(`Existing nodes: ${nodeSet.size}`);
  console.log(`Missing proteins referenced in edges: ${toAppend.length}`);
  if (toAppend.length === 0) {
    console.log("Nothing to append. Exiting.");
    return;
  }

  // Backup nodes.csv
  const backupPath = NODES_CSV + ".bak";
  fs.copyFileSync(NODES_CSV, backupPath);
  console.log(`Backup created: ${backupPath}`);

  // Append rows with empty metadata fields
  const appendedLines = toAppend.map((p) => `"${p}","","","","",""`);
  const out = nodeLines.concat(appendedLines).join("\n") + "\n";
  fs.writeFileSync(NODES_CSV, out);
  console.log(`Appended ${appendedLines.length} rows to nodes.csv`);
}

try {
  main();
} catch (err) {
  console.error("Error:", err.message);
  process.exit(1);
}
