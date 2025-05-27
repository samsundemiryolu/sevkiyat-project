document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("shipForm");
  const tbody = document.querySelector("#shipTable tbody");

  // 🛟 Kaydet
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const summaryNumber = document.getElementById("summaryNumber").value.trim();
    const name = document.getElementById("name").value.trim();
    const arrivalDate = document.getElementById("arrivalDate").value;

    if (!summaryNumber || !name || !arrivalDate) {
      alert("Lütfen tüm alanları doldurun.");
      return;
    }

    const shipData = { summaryNumber, name, arrivalDate };

    try {
      const res = await fetch("/ships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shipData),
      });
      const msg = await res.text();
      alert(msg);
      loadShips(); // kayıt sonrası liste güncellensin
      form.reset();
    } catch (err) {
      console.error("Kayıt hatası:", err);
    }
  });

  // 🚢 Listele
  async function loadShips() {
    const res = await fetch("/ships/list");
    const data = await res.json();

    tbody.innerHTML = "";
    data.forEach((ship, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${ship.summaryNumber}</td>
        <td>${ship.name}</td>
        <td>${ship.arrivalDate}</td>
        <td>
          <button onclick="editShip(${index})">Düzenle</button>
          <button onclick="deleteShip(${index})">Sil</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  window.editShip = async (index) => {
    const res = await fetch("/ships/list");
    const ships = await res.json();
    const ship = ships[index];

    document.getElementById("summaryNumber").value = ship.summaryNumber;
    document.getElementById("name").value = ship.name;
    document.getElementById("arrivalDate").value = ship.arrivalDate;
  };

  // ❌ Sil
  window.deleteShip = async (index) => {
    if (!confirm("Silmek istediğinize emin misiniz?")) return;

    try {
      const res = await fetch(`/ships/delete/${index}`, { method: "DELETE" });
      const msg = await res.text();
      alert(msg);
      loadShips();
    } catch (err) {
      console.error("Silme hatası:", err);
    }
  };

  loadShips(); // sayfa yüklendiğinde listele
});
