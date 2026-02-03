const fs = require('fs');

const content = fs.readFileSync('database.sql', 'utf8');
const stmts = content.split(';');

console.log('Total parts after split:', stmts.length);
console.log('\nFiltered statements:');

let count = 0;
for (let i = 0; i < stmts.length; i++) {
  const stmt = stmts[i].trim();
  if (!stmt || stmt.startsWith('--')) {
    console.log(`[${i}] SKIPPED: ${stmt.substring(0, 50)}`);
    continue;
  }
  if (stmt.toUpperCase().startsWith('USE ')) {
    console.log(`[${i}] SKIPPED (USE): ${stmt.substring(0, 50)}`);
    continue;
  }
  count++;
  console.log(`[${count}] INCLUDED: ${stmt.substring(0, 70)}`);
}

console.log('\nTotal included statements:', count);
