// public/js/sevkiyatForm.js

// ✔ Vagon Seçme Butonu Fonksiyonu — DOMContentLoaded dışında, global erişilebilir olmalı
window.selectVagon = function(id, type) {
  document.getElementById("aracNo").value = id;
  document.getElementById("aracTipi").value = type;
  document.getElementById("vagonModal").classList.add("hidden");
};

// ✔ Ana blok
document.addEventListener("DOMContentLoaded", async () => {
  const baseUrl = window.baseUrl || "";

  // Element seçiciler
  const shipSel = document.getElementById("shipSel");
  const firmaSel = document.getElementById("firmaSel");
  const subSel = document.getElementById("subSel");
  const loadBtn = document.getElementById("loadBtn");
  const entryTbody = document.querySelector("#entryTable tbody");
  const totAdet = document.getElementById("totAdet");
  const totNet = document.getElementById("totNet");
  const totBrut = document.getElementById("totBrut");

  const aracCinsiSel = document.getElementById("aracCinsiSel");
  const tirBlock1 = document.getElementById("tirBlock1");
  const tirBlock2 = document.getElementById("tirBlock2");
  const tirBlock3 = document.getElementById("tirBlock3");
  const tirFatura = document.getElementById("tirFatura");
  const tirFaturaTitle = document.getElementById("tirFaturaTitle");

  const vagonFatura = document.getElementById("vagonFatura");
  const vagonFaturaTitle = document.getElementById("vagonFaturaTitle");

  const aracNoBlock = document.getElementById("aracNoBlock");
  const vagonModal = document.getElementById("vagonModal");
  const vagonSearch = document.getElementById("vagonSearch");
  const vagonTableBody = document.getElementById("vagonTableBody");
  const openVagonListBtn = document.getElementById("openVagonListBtn");
  const closeVagonListBtn = document.getElementById("closeVagonListBtn");

  const tonajEl = document.getElementById("tonajDurumu");
  const kalanEl = document.getElementById("kalanTonaj");

  const aracNoInput = document.getElementById("aracNo");
  const aracTipiInput = document.getElementById("aracTipi");

  // ✔ Dinamik tür kontrolü ve buton gösterme
  aracCinsiSel.addEventListener("change", () => {
    const val = aracCinsiSel.value;
    aracNoBlock.classList.remove("hidden");

    if (val === "VAGON") {
      aracNoInput.readOnly = true;
      openVagonListBtn.classList.remove("hidden");
    } else {
      aracNoInput.readOnly = false;
      openVagonListBtn.classList.add("hidden");
      aracNoInput.value = "";
    }

    [tirBlock1, tirBlock2, tirBlock3, tirFatura, tirFaturaTitle]
      .forEach(el => el?.classList.toggle("hidden", val !== "TIR"));

    [vagonFatura, vagonFaturaTitle]
      .forEach(el => el?.classList.toggle("hidden", val !== "VAGON"));
  });

  // ✔ Vagon Modal Aç/Kapat
  openVagonListBtn.addEventListener("click", showVagonModal);
  closeVagonListBtn.addEventListener("click", hideVagonModal);
  vagonSearch.addEventListener("input", renderVagonTable);

  function showVagonModal() {
    vagonModal.classList.remove("hidden");
    loadVagonList();
  }

  function hideVagonModal() {
    vagonModal.classList.add("hidden");
  }

  // ✔ Vagon Listesini Yükle
async function loadVagonList() {
  vagonTableBody.innerHTML = "<tr><td colspan='3'>Yükleniyor...</td></tr>";

  try {
    const res = await fetch(`${baseUrl}/vehicles/list`);
    allVehicles = await res.json();  // global değişken
    renderVagonTable();
  } catch (err) {
    vagonTableBody.innerHTML = `<tr><td colspan='3'>❌ Hata: ${err.message}</td></tr>`;
  }
}


  // ✔ Vagon Listesini Çiz
  let allVehicles = [];
function renderVagonTable() {
  const searchTerm = vagonSearch.value.toLowerCase();
  const tbody = vagonTableBody;
  tbody.innerHTML = "";

  allVehicles
    .filter(v =>
      v.vehicleClass.toLowerCase() === "vagon" &&
      (v.id.toLowerCase().includes(searchTerm) ||
       v.vehicleType.toLowerCase().includes(searchTerm))
    )
    .forEach(v => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${v.id}</td>
        <td>${v.vehicleType || ""}</td>
        <td><button type="button" class="selVagonBtn">Seç</button></td>
      `;
      tbody.appendChild(tr);

      // Butonu al ve inputları doldur
      const btn = tr.querySelector(".selVagonBtn");
      btn.addEventListener("click", () => {
        aracNoInput.value = v.id;
        aracTipiInput.value = v.vehicleType || "";
        hideVagonModal();
      });
    });
}

  const fetchJson = async (path) => (await fetch(`${baseUrl}${path}`)).json();
  let ships = [], firms = [], checklist = [], shipments = [];

  try {
    shipments = await fetchJson("/sevkiyat/list");
  } catch (e) {
    console.warn("Sevkiyatlar yüklenemedi:", e);
  }

ships = await fetchJson("/ships.json");
firms = await fetchJson("/firms.json");
checklist = await fetchJson("/checklist.json");
vehicles = await fetchJson("/vehicles.json");
shipments = await fetchJson("/shipment.json");


// ✔ Şimdi burası gelebilir (senin paylaştığın ekran görüntüsündeki yapı)

 const shipIds = [...new Set(checklist.map(r => r.shipId))];
shipSel.innerHTML = '<option value="">-- Seçiniz --</option>';

shipIds.forEach(sid => {
  const ship = ships.find(s => s.id === sid);
  const shipName = ship ? ship.name : sid;

  // Eğer ID ve name aynıysa sadece biri yazılsın
  const display = (sid === shipName) ? shipName : `${sid} - ${shipName}`;
  shipSel.innerHTML += `<option value="${sid}">${display}</option>`;
});
  shipSel.disabled = false;

  shipSel.addEventListener("change", onShipChange);
  firmaSel.addEventListener("change", onFirmaChange);
  subSel.addEventListener("change", () => loadBtn.disabled = !subSel.value);
  loadBtn.addEventListener("click", openChecklistPopup);
  document.getElementById("saveBtn").addEventListener("click", (e) => {
    e.preventDefault();
    kaydetForm();
  });

  function onShipChange() {
    const sid = shipSel.value;
    firmaSel.innerHTML = `<option value="">-- Seçiniz --</option>`;
    subSel.innerHTML = `<option value="">-- Seçiniz --</option>`;
    firmaSel.disabled = !sid;
    subSel.disabled = true;
    loadBtn.disabled = true;
    if (!sid) return;

    const fids = [...new Set(checklist.filter(r => r.shipId === sid).map(r => r.firmaId))];
firmaSel.innerHTML = '<option value="">-- Seçiniz --</option>';

fids.forEach(fid => {
  const firma = firms.find(f => f.id === fid);  // 👈 Firma adını bul
  const firmaName = firma ? firma.name : fid;  // 👈 Firma yoksa ID yaz
  firmaSel.innerHTML += `<option value="${fid}">${firmaName}</option>`;
});
  }

  function onFirmaChange() {
    const sid = shipSel.value, fid = firmaSel.value;
    subSel.innerHTML = `<option value="">-- Seçiniz --</option>`;
    subSel.disabled = !fid;
    loadBtn.disabled = true;
    if (!fid) return;

    const subs = [...new Set(checklist
  .filter(r => r.shipId === sid && r.firmaId === fid)
  .map(r => r.subFirmId.split("-")[1]))];

subSel.innerHTML = '<option value="">-- Seçiniz --</option>';

subs.forEach(name => {
  subSel.innerHTML += `<option value="${name}">${name}</option>`;
});

  }

  function openChecklistPopup() {
    const shipId = shipSel.value;
    const firmaId = firmaSel.value;
    const subFirmId = `${firmaId}-${subSel.value}`;
    const url = `${baseUrl}/yukleme?shipId=${shipId}&firmaId=${firmaId}&subFirmId=${subFirmId}`;
    window.openedPopup = window.open(url, "YuklemeListesi", "width=900,height=600");
  }

  window.addRow = (row) => {
    const tr = document.createElement("tr");
    tr.dataset.shipId = shipSel.value;
    tr.dataset.firmaId = firmaSel.value;
    tr.dataset.subFirmId = `${firmaSel.value}-${subSel.value}`;
    tr.dataset.net = row.net;
    tr.dataset.brut = row.brut;
    tr.innerHTML = `
      <td>${row.parti}</td>
      <td>${row.ebat}</td>
      <td>${row.net.toFixed(3).replace('.', ',')}</td>
      <td>${row.brut.toFixed(3).replace('.', ',')}</td>
      <td><button type="button" onclick="removeRow(this)">X</button></td>
    `;
    entryTbody.appendChild(tr);
    updateTotals();
  };
window.removeRow = (function () {
  // Birbirini takip eden RESTORE çağrılarını sıraya koymak için:
  let queue = Promise.resolve();

  return function(btn) {
    // 👇 Tıklanan butonun ait olduğu <tr> elementini seç
    const row = btn.closest("tr");
    console.log("Silinecek satır:", row);

    // Satırın verilerini oku
    const item = {
      shipId:   row.dataset.shipId,
      firmaId:  row.dataset.firmaId,
      subFirmId:row.dataset.subFirmId,
      parti:    row.cells[0].textContent,
      ebat:     row.cells[1].textContent,
      net:      parseFloat(row.dataset.net),
      brut:     parseFloat(row.dataset.brut)
    };
    console.log("🔄 removeRow tıklandı, gönderilecek item:", item);

    // Kuyruğa al: önceki istek bitmeden yenisi başlamayacak
    queue = queue.then(async () => {
      console.log("📤 RESTORE isteği gönderiliyor…");
      const res = await fetch(`${baseUrl}/yukleme/restoreChecklistItem`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(item)
      });

      const result = await res.json();
      console.log("📥 RESTORE yanıtı geldi:", result);

      if (result.success) {
        console.log("✅ Geri alma başarılı, yalnızca bu satır kaldırılıyor");
        row.remove();
        updateTotals();
if (result.success) {
  row.remove();
  updateTotals();

  // ▶️ Popup açıksa yenile
  if (window.openedPopup && !window.openedPopup.closed) {
    window.openedPopup.location.reload();
  }
}
      } else {
        console.warn("⚠️ Geri alma başarısız:", result.error);
      }
    }).catch(err => {
      console.error("❌ RESTORE isteğinde hata:", err);
    });

    return queue;
  };
})();


  function updateTotals() {
    let adet=0, net=0, brut=0;
    entryTbody.querySelectorAll("tr").forEach(r => {
      adet++; net  += parseFloat(r.dataset.net)||0;
      brut += parseFloat(r.dataset.brut)||0;
    });

    totAdet.textContent = adet;
    totNet .textContent = net.toFixed(3).replace(".",",");
    totBrut.textContent = brut.toFixed(3).replace(".",",");

    toplamBrut = brut;
    updateTonajDurumu();
  }

  function updateTonajDurumu() {
    if (!tonajEl) return;
    if      (toplamBrut < secilenVagon.minTon) {
      tonajEl.textContent = `⚠️ Düşük Yük: ${toplamBrut.toFixed(2)} t (min ${secilenVagon.minTon} t)`;
      tonajEl.style.color = "orange";
    }
    else if (toplamBrut > secilenVagon.maxTon) {
      tonajEl.textContent = `❌ Aşıldı: ${toplamBrut.toFixed(2)} t (max ${secilenVagon.maxTon} t)`;
      tonajEl.style.color = "red";
    }
    else {
      tonajEl.textContent = `✔️ Uygun: ${toplamBrut.toFixed(2)} t`;
      tonajEl.style.color = "green";
    }
    if (kalanEl) {
      kalanEl.textContent = `Kalan Yüklenebilir Tonaj: ${(secilenVagon.maxTon - toplamBrut).toFixed(2)} t`;
    }
  }

window.hesaplaTir = () => {
  const t  = parseFloat(document.getElementById("kantar").value)||0;
  const f  = parseFloat(document.getElementById("karayoluFiyat").value)||0;
  const kdv = parseFloat(document.getElementById("kdvOran").value)||0;
  const fac = parseFloat(document.getElementById("karayoluFatura").value)||0;
  const b = parseFloat(totBrut.textContent.replace(',', '.')) || 0;

  const tut = f * b;
  const tutKdv = tut * kdv / 100;
  const tev = tut * 0.18;
  const nav = tut + tutKdv + tev;
  const kontrol = fac - nav;

  document.getElementById("karayoluKdv").value = kdv.toFixed(2).replace('.', ',') + ' ₺';
  document.getElementById("tevkifat").value = tev.toFixed(2).replace('.', ',') + ' ₺';
  document.getElementById("karayoluNavlun").value = nav.toFixed(2).replace('.', ',') + ' ₺';
  document.getElementById("karayoluKontrol").value = kontrol.toFixed(2).replace('.', ',') + ' ₺';
};

window.hesaplaVagon = () => {
  const f = parseFloat(document.getElementById("tcddFiyat").value)||0;
  const p = parseFloat(document.getElementById("kiymetPrimi").value)||0;
  const fac = parseFloat(document.getElementById("tcddFaturaTutari").value)||0;
  const b = parseFloat(totBrut.textContent.replace(',', '.')) || 0;

  const nav = f * b + p;
  const kontrol = fac - nav;

  document.getElementById("tcddNavlun").value = nav.toFixed(2).replace('.', ',') + ' ₺';
  document.getElementById("tcddFaturaKontrol").value = kontrol.toFixed(2).replace('.', ',') + ' ₺';
};

async function kaydetForm() {
    const formData = {
      shipId: shipSel.value,
      firmaId: firmaSel.value,
      subUnit: subSel.value,
      aracCinsi: aracCinsiSel.value,
      aracNo: aracNoInput.value.trim(),
      aracTipi: aracTipiInput.value.trim(),
      ortak: document.getElementById("ortakCheckbox").checked,
      paketler: Array.from(entryTbody.querySelectorAll("tr")).map(tr => ({
        parti: tr.cells[0].textContent,
        ebat: tr.cells[1].textContent,
        net: parseFloat(tr.dataset.net),
        brut: parseFloat(tr.dataset.brut)
      })),
      totals: {
        adet: totAdet.textContent,
        net: totNet.textContent,
        brut: totBrut.textContent
      },
      status: {
        sevkDurumu: "ÇIKIŞ",
        durumTarihi: new Date().toISOString(),
        cikisTarihi: new Date().toISOString()
      },
      payment: {
        odemeDurumu: "BEKLİYOR",
        odemeTarihi: new Date().toISOString()
      }
    };

    try {
      const res = await fetch(`${baseUrl}/sevkiyat/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      if (result.success) {
        alert(`Sevkiyat kaydedildi! ID: ${result.id}`);
        if (window.openedPopup && !window.openedPopup.closed) {
          window.openedPopup.close();
        }
        window.location.reload();
      } else {
        // Burada + eksikti
        alert("Hata: " + (result.error || "Kayıt başarısız."));
      }
    } catch (err) {
      // Burada + eksikti
      alert("Sunucu hatası: " + err.message);
    }
  }
});