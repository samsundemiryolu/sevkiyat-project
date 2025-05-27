document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("vehicleForm");
  const tbody = document.querySelector("#vehicleTable tbody");

  // 🚚 Kaydet
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("id").value.trim();
    const vehicleClass = document.getElementById("vehicleClass").value.trim();
    const vehicleType = document.getElementById("vehicleType").value.trim();
    const minTon = document.getElementById("minTon").value.trim();
    const maxTon = document.getElementById("maxTon").value.trim();

    if (!id || !vehicleClass || !vehicleType || !minTon || !maxTon) {
      alert("Tüm alanları doldurun.");
      return;
    }

    const vehicleData = { id, vehicleClass, vehicleType, minTon, maxTon };

    try {
      const res = await fetch(`${baseUrl}/vehicles/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vehicleData),
      });

      const msg = await res.text();
      alert(msg);
      loadVehicles();
      form.reset();
    } catch (err) {
      console.error("Kayıt hatası:", err);
    }
  });

  // 🚛 Listele
  async function loadVehicles() {
    try {
      const res = await fetch(`${baseUrl}/vehicles/list`);
      const data = await res.json();

      tbody.innerHTML = "";
      data.forEach((v, i) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${v.id}</td>
          <td>${v.vehicleClass}</td>
          <td>${v.vehicleType}</td>
          <td>${v.minTon}</td>
          <td>${v.maxTon}</td>
        `;
        tbody.appendChild(row);
      });
    } catch (err) {
      console.error("Listeleme hatası:", err);
    }
  }

  loadVehicles(); // Sayfa açıldığında otomatik listele
});
