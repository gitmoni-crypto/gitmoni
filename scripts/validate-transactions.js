// Validate transaction files for GitMoni blockchain
import fs from 'fs';
import path from 'path';

const TX_DIR = 'data/txs';

// Expected transaction schema
function validateTransactionSchema(tx, filename) {
  const errors = [];
  
  // Required fields
  const requiredFields = ['txid', 'from', 'to', 'amount', 'nonce', 'ts', 'memo'];
  for (const field of requiredFields) {
    if (!(field in tx)) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  // Type validation
  if (typeof tx.txid !== 'string') errors.push('txid must be string');
  if (typeof tx.from !== 'string') errors.push('from must be string');
  if (typeof tx.to !== 'string') errors.push('to must be string');
  if (typeof tx.amount !== 'number' || tx.amount <= 0) errors.push('amount must be positive number');
  if (typeof tx.nonce !== 'number' || tx.nonce <= 0) errors.push('nonce must be positive number');
  if (typeof tx.ts !== 'number' || tx.ts <= 0) errors.push('ts must be positive number (timestamp)');
  if (typeof tx.memo !== 'string') errors.push('memo must be string');
  
  // Format validation
  if (tx.txid && !tx.txid.includes('->')) errors.push('txid must contain "->" separator');
  if (tx.from && !tx.from.startsWith('gh:')) errors.push('from must start with "gh:"');
  if (tx.to && !tx.to.startsWith('gh:')) errors.push('to must start with "gh:"');
  
  // Filename consistency
  const expectedPattern = /^\d{8}T\d{6}Z-gh_\w+-to-gh_\w+-\d+\.json$/;
  if (!expectedPattern.test(path.basename(filename))) {
    errors.push(`Filename doesn't match expected pattern: ${filename}`);
  }
  
  return errors;
}

// Check for duplicate transactions
function findDuplicates(transactions) {
  const seen = new Set();
  const duplicates = [];
  
  for (const { tx, filename } of transactions) {
    if (seen.has(tx.txid)) {
      duplicates.push(`Duplicate txid: ${tx.txid} in ${filename}`);
    }
    seen.add(tx.txid);
  }
  
  return duplicates;
}

// Validate nonce sequence for each address
function validateNonces(transactions) {
  const nonces = {};
  const errors = [];
  
  for (const { tx, filename } of transactions) {
    if (tx.from === 'gh:system') {
      // System transactions should have sequential nonces
      if (!nonces[tx.from]) nonces[tx.from] = [];
      nonces[tx.from].push({ nonce: tx.nonce, filename });
    }
  }
  
  // Check system nonces are sequential
  if (nonces['gh:system']) {
    const systemNonces = nonces['gh:system'].sort((a, b) => a.nonce - b.nonce);
    for (let i = 0; i < systemNonces.length; i++) {
      const expected = i + 1;
      if (systemNonces[i].nonce !== expected) {
        errors.push(`System nonce gap: expected ${expected}, got ${systemNonces[i].nonce} in ${systemNonces[i].filename}`);
      }
    }
  }
  
  return errors;
}

// Main validation function
function validateTransactions() {
  console.log('=== GitMoni Transaction Validation ===');
  
  if (!fs.existsSync(TX_DIR)) {
    console.log('❌ Transaction directory not found:', TX_DIR);
    process.exit(1);
  }
  
  const files = fs.readdirSync(TX_DIR).filter(f => f.endsWith('.json'));
  console.log(`📁 Found ${files.length} transaction files`);
  
  if (files.length === 0) {
    console.log('✅ No transactions to validate');
    return;
  }
  
  const transactions = [];
  let parseErrors = 0;
  
  // Load and parse all transactions
  for (const file of files) {
    const filepath = path.join(TX_DIR, file);
    try {
      const content = fs.readFileSync(filepath, 'utf8');
      const tx = JSON.parse(content);
      transactions.push({ tx, filename: file });
    } catch (error) {
      console.log(`❌ Failed to parse ${file}: ${error.message}`);
      parseErrors++;
    }
  }
  
  if (parseErrors > 0) {
    console.log(`❌ ${parseErrors} files failed to parse`);
    process.exit(1);
  }
  
  console.log(`📋 Parsed ${transactions.length} transactions successfully`);
  
  // Run validations
  let totalErrors = 0;
  
  // 1. Schema validation
  console.log('\n🔍 Validating transaction schemas...');
  for (const { tx, filename } of transactions) {
    const errors = validateTransactionSchema(tx, filename);
    if (errors.length > 0) {
      console.log(`❌ ${filename}:`);
      errors.forEach(err => console.log(`   - ${err}`));
      totalErrors += errors.length;
    }
  }
  
  // 2. Duplicate detection
  console.log('\n🔍 Checking for duplicates...');
  const duplicates = findDuplicates(transactions);
  if (duplicates.length > 0) {
    duplicates.forEach(dup => console.log(`❌ ${dup}`));
    totalErrors += duplicates.length;
  }
  
  // 3. Nonce validation
  console.log('\n🔍 Validating nonce sequences...');
  const nonceErrors = validateNonces(transactions);
  if (nonceErrors.length > 0) {
    nonceErrors.forEach(err => console.log(`❌ ${err}`));
    totalErrors += nonceErrors.length;
  }
  
  // Summary
  console.log('\n' + '='.repeat(40));
  if (totalErrors === 0) {
    console.log('✅ All transactions are valid!');
    console.log(`📊 Summary: ${transactions.length} transactions, 0 errors`);
  } else {
    console.log(`❌ Found ${totalErrors} validation errors`);
    console.log(`📊 Summary: ${transactions.length} transactions, ${totalErrors} errors`);
    process.exit(1);
  }
}

// Run validation
validateTransactions();
