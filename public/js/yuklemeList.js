// public/js/yuklemeList.js (Web Versiyonu)

document.addEventListener("DOMContentLoaded", () => {
  const tblBody     = document.getElementById("tblBody");
  const filterInput = document.getElementById("filterInput");
  const totalCount  = document.getElementById("totalCount");
  const totalNet    = document.getElementById("totalNet");
  const totalBrut   = document.getElementById("totalBrut");

let allRows = [];

const urlParams = new URLSearchParams(window.location.search);
const filters = {
  shipId: urlParams.get("shipId"),
  firmaId: urlParams.get("firmaId"),
  subFirmId: urlParams.get("subFirmId")
};

fetch("/yukleme/checklist")
  .then(res => res.json())
  .then(data => {
    allRows = data;
    renderTable();
  });

  // filtreleme input'u
  filterInput.addEventListener("input", renderTable);

  function renderTable() {
    tblBody.innerHTML = "";
    const txt = filterInput.value.toLowerCase();

const filtered = allRows
  .filter(r =>
    r.shipId?.toString().toLowerCase() === filters.shipId?.toLowerCase() &&
    r.firmaId?.toString() === filters.firmaId &&
    r.subFirmId?.toLowerCase() === filters.subFirmId?.toLowerCase()
  )
  .filter(r => {
    const p = r.parti.toLowerCase();
    const e = r.ebat.toLowerCase();
    return p.includes(txt) || e.includes(txt);
  });

    filtered.forEach(r => {
      const net  = parseFloat(r.net)  || 0;
      const brut = parseFloat(r.brut) || 0;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.parti}</td>
        <td>${r.ebat}</td>
        <td>${net.toFixed(3).replace('.', ',')}</td>
        <td>${brut.toFixed(3).replace('.', ',')}</td>
        <td><button class="sel">Seç</button></td>
      `;
      tr.querySelector(".sel").addEventListener("click", async () => {
        // Üst forma satır gönder
        if (window.opener && typeof window.opener.addRow === "function") {
          window.opener.addRow({ parti: r.parti, ebat: r.ebat, net, brut });
        }

        // JSON’dan sil
await fetch(`${baseUrl}/yukleme/removeChecklistItem`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    shipId: r.shipId,
    firmaId: r.firmaId,
    subFirmId: r.subFirmId,
    parti: r.parti,
    ebat: r.ebat,
    net,
    brut
  })
});

// ✅ yerel listedeki veriyi de çıkar
allRows = allRows.filter(p =>
  !(
    p.shipId === r.shipId &&
    p.firmaId === r.firmaId &&
    p.subFirmId === r.subFirmId &&
    p.parti === r.parti &&
    p.ebat === r.ebat &&
    parseFloat(p.net) === net &&
    parseFloat(p.brut) === brut
  )
);

// ✅ yeniden çiz
renderTable();
      });
      tblBody.appendChild(tr);
    });

    // toplamlar
    totalCount.textContent = filtered.length;
    totalNet.textContent   = filtered.reduce((acc, r) => acc + (parseFloat(r.net)  || 0), 0).toFixed(3).replace('.', ',');
    totalBrut.textContent  = filtered.reduce((acc, r) => acc + (parseFloat(r.brut) || 0), 0).toFixed(3).replace('.', ',');
  }
});
