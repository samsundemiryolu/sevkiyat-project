const fs = require("fs");
const path = require("path");

function unsetChecklistAssigned(partiList) {
  const filePath = path.join(__dirname, '../data/checklists.json');
  const checklist = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  const updatedChecklist = checklist.map(item => {
    if (partiList.includes(item.parti)) {
      console.log(`🔄 ${item.parti} geri alındı`);
      item.assigned = false;
    }
    return item;
  });

  fs.writeFileSync(filePath, JSON.stringify(updatedChecklist, null, 2), 'utf-8');
}
exports.unsetChecklistAssigned = unsetChecklistAssigned;

