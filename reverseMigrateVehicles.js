// reverseMigrateVehicles.js
const fs   = require('fs');
const path = require('path');

// 1) Şu anki (Electron) vehicles.json yolu:
const vehiclesPath = path.join(__dirname, 'data', 'vehicles.json');
// 2) Script’in üreteceği eski formatı yazacağı dosya:
const outputPath   = path.join(__dirname, 'oldVehicles.json');

// 3) Elektron’daki veriyi oku
let vehicles;
try {
  vehicles = JSON.parse(fs.readFileSync(vehiclesPath, 'utf8'));
} catch (err) {
  console.error('❌ vehicles.json okunamadı:', err);
  process.exit(1);
}

// 4) Her kaydı dönüştür
const oldFormat = vehicles.map(v => ({
  id:           v.vehicleNumber,             // vehicleNumber → id
  vehicleClass: v.vehicleClass.toLowerCase(), // “VAGON” → “vagon”
  vehicleType:  v.vehicleType,               // aynen al
  minTon:       v.minLoad  ?.toString() || '', // minLoad → minTon
  maxTon:       v.maxLoad  ?.toString() || ''  // maxLoad → maxTon
}));

// 5) Dosyaya yaz
fs.writeFileSync(outputPath, JSON.stringify(oldFormat, null, 2), 'utf8');
console.log(`✅ ${oldFormat.length} araç eski formata çevrildi → ${outputPath}`);
