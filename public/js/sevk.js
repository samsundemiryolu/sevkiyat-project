// public/js/sevk.js
document.addEventListener("DOMContentLoaded", async () => {
  const tbody        = document.getElementById("shipmentsTbody");
  const filterShip   = document.getElementById("filterShip");
  const filterFirma  = document.getElementById("filterFirma");
  const filterSub    = document.getElementById("filterSubUnit");
  const filterArac   = document.getElementById("filterAracNo");
  const aracNoList   = document.getElementById("aracNoList");

  let allShipments = [];

  // 1) JSON’u al
  try {
    const res = await fetch(`${baseUrl}/sevk/shipments`);
    allShipments = await res.json();
  } catch (err) {
    console.error("Sevkiyat listesi alınamadı:", err);
    return;
  }

  // 2) filtre dropdown’ları ve datalist’i hazırla
  populateFilters();
  renderTable();

  [filterShip, filterFirma, filterSub, filterArac].forEach(el =>
    el.addEventListener("input", renderTable)
  );

  // --- Fonksiyonlar ---

  function populateFilters() {
    // gemi
    const ships = [...new Set(allShipments.map(s => s.shipId))];
    filterShip.innerHTML = `<option value="">— Gemi —</option>`
      + ships.map(s => `<option>${s}</option>`).join("");

    // firma
    const firms = [...new Set(allShipments.map(s => s.firmaId))];
    filterFirma.innerHTML = `<option value="">— Firma —</option>`
      + firms.map(f => `<option>${f}</option>`).join("");

    // alt birim
    const subs = [...new Set(allShipments.map(s => s.subUnit))];
    filterSub.innerHTML = `<option value="">— Alt Birim —</option>`
      + subs.map(u => `<option>${u}</option>`).join("");

    // araç no datalist
    const nos = [...new Set(allShipments.map(s => s.aracNo))];
    aracNoList.innerHTML = nos.map(n => `<option value="${n}">`).join("");
  }

  function renderTable() {
    tbody.innerHTML = "";

    const filtered = allShipments.filter(r => {
      return  (filterShip.value   === "" || r.shipId   === filterShip.value)
           && (filterFirma.value  === "" || r.firmaId  === filterFirma.value)
           && (filterSub.value    === "" || r.subUnit  === filterSub.value)
           && (filterArac.value   === "" || (r.aracNo||"").includes(filterArac.value));
    });

    filtered.forEach((r, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.id}</td>
        <td>${r.shipId}</td>
        <td>${r.firmaId}</td>
        <td>${r.subUnit || ""}</td>
        <td>${r.aracNo || ""}</td>
        <td>${r.aracTipi || ""}</td>
        <td>${r.status?.sevkDurumu  || "-"}</td>
        <td>${(r.status?.durumTarihi || "").slice(0,10) || "-"}</td>
        <td><button onclick="guncelleDurum(${i})">✉</button></td>
        <td>${r.payment?.odemeDurumu || "-"}</td>
        <td><button onclick="guncelleOdeme(${i})">₺</button></td>
        <td><a href="/sevkiyat/edit/${r.id}">✏ KaydaGit</a></td>
      `;
      tbody.appendChild(tr);
    });
  }

  window.guncelleDurum = async (idx) => {
    const rec = allShipments[idx];
    const yeni  = prompt("Yeni Sevk Durumu:", rec.status?.sevkDurumu || "");
    if (!yeni) return;
    const tarih = new Date().toISOString();
    const res   = await fetch(`${baseUrl}/sevk/updateStatus`, {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ id:rec.id, yeniDurum:yeni, tarih })
    });
    const j = await res.json();
    if (j.success) { rec.status = { sevkDurumu:yeni, durumTarihi:tarih }; renderTable(); }
    else           alert("Hata: "+j.error);
  };

  window.guncelleOdeme = async (idx) => {
    const rec = allShipments[idx];
    const yeni = prompt("Yeni Ödeme Durumu:", rec.payment?.odemeDurumu || "");
    if (!yeni) return;
    const tarih = new Date().toISOString();
    const res   = await fetch(`${baseUrl}/sevk/updatePayment`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ id:rec.id, odemeDurumu:yeni, odemeTarihi:tarih })
    });
    const j = await res.json();
    if (j.success) { rec.payment = { odemeDurumu:yeni, odemeTarihi:tarih }; renderTable(); }
    else           alert("Hata: "+j.error);
  };

  // Ana sayfaya dön
  window.goHome = () => location.href = "/obs";
});
