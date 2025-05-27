const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../data/checklists.json');

const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

const updated = data.map(item => {
  if (!item.hasOwnProperty('assigned')) {
    item.assigned = false;
  }
  return item;
});

fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf-8');
console.log('✅ "assigned": false alanı tüm kayıtlara eklendi.');
