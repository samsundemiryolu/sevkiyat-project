// addIdToVehicles.js

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data/vehicles.json'); // Gerekirse yolu güncelle

// JSON dosyasını oku
let vehicles = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Her araca id ekle (1'den başlayarak)
vehicles = vehicles.map((v, index) => ({
  id: index + 1,
  ...v
}));

// Güncellenmiş veriyi dosyaya yaz
fs.writeFileSync(filePath, JSON.stringify(vehicles, null, 2), 'utf8');

console.log("✅ Tüm araçlara ID başarıyla eklendi.");
