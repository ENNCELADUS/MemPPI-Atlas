#!/usr/bin/env node
/**
 * Prepares CSV files for Supabase import by converting headers to match database column names
 * Run with: node scripts/prepare-csvs-for-import.js
 */

const fs = require('fs');
const readline = require('readline');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'supabase-import');

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Process nodes CSV
 */
async function processNodesCSV() {
  console.log('Processing node_info_with_exp.csv...');
  
  const inputFile = path.join(DATA_DIR, 'node_info_with_exp.csv');
  const outputFile = path.join(OUTPUT_DIR, 'nodes.csv');
  
  const readStream = fs.createReadStream(inputFile);
  const writeStream = fs.createWriteStream(outputFile);
  
  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity
  });

  let isFirstLine = true;
  let lineCount = 0;

  for await (const line of rl) {
    if (isFirstLine) {
      // Replace header with database column names
      const newHeader = '"protein","entry_name","description","gene_names","family","expression_tissue"';
      writeStream.write(newHeader + '\n');
      isFirstLine = false;
    } else {
      // Write data lines as-is
      writeStream.write(line + '\n');
      lineCount++;
    }
  }

  writeStream.end();
  console.log(`✅ Nodes CSV created: ${outputFile}`);
  console.log(`   Processed ${lineCount} data rows`);
}

/**
 * Process edges CSV
 */
async function processEdgesCSV() {
  console.log('\nProcessing edge_info_with_exp.csv...');
  
  const inputFile = path.join(DATA_DIR, 'edge_info_with_exp.csv');
  const outputFile = path.join(OUTPUT_DIR, 'edges.csv');
  
  const readStream = fs.createReadStream(inputFile);
  const writeStream = fs.createWriteStream(outputFile);
  
  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity
  });

  let isFirstLine = true;
  let lineCount = 0;

  for await (const line of rl) {
    if (isFirstLine) {
      // Replace header with database column names
      const newHeader = '"edge","protein1","protein2","fusion_pred_prob","enriched_tissue","tissue_enriched_confidence","positive_type"';
      writeStream.write(newHeader + '\n');
      isFirstLine = false;
    } else {
      // Replace NA values with empty strings, but preserve text like "high confidence"
      // Only numeric columns need NA converted (fusion_pred_prob in column 4)
      // Text columns can keep NA or convert - we'll convert all for consistency
      let processedLine = line;
      
      // Replace ,NA, (NA between commas) - run multiple times to handle consecutive NAs
      while (processedLine.includes(',NA,')) {
        processedLine = processedLine.replace(/,NA,/g, ',,');
      }
      
      // Replace ,NA" (NA followed by comma and quote)
      processedLine = processedLine.replace(/,NA,"/g, ',,"');
      
      // Replace ",NA, (quote, comma, NA, comma)
      processedLine = processedLine.replace(/",NA,/g, '",,');
      
      writeStream.write(processedLine + '\n');
      lineCount++;
    }
  }

  writeStream.end();
  console.log(`✅ Edges CSV created: ${outputFile}`);
  console.log(`   Processed ${lineCount} data rows`);
  console.log(`   Note: Converted "NA" to empty values for numeric columns`);
}

// Run the conversion
(async () => {
  try {
    await processNodesCSV();
    await processEdgesCSV();
    console.log('\n✨ All CSV files prepared for import!');
    console.log(`📁 Import files are in: ${OUTPUT_DIR}`);
    console.log('\nNext steps:');
    console.log('1. Go to Supabase Table Editor → nodes table');
    console.log('2. Import data/supabase-import/nodes.csv');
    console.log('3. Go to Supabase Table Editor → edges table');
    console.log('4. Import data/supabase-import/edges.csv');
  } catch (error) {
    console.error('❌ Error processing CSV files:', error);
    process.exit(1);
  }
})();

