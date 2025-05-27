let subunits = [];

document.addEventListener("DOMContentLoaded", () => {
  loadFirms();

  document.getElementById("firmForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    if (!name || subunits.length === 0) {
      return alert("Firma adı ve en az bir alt birim girilmelidir.");
    }

    const editingId = document.getElementById("firmForm").dataset.editingId;
    const url = editingId
      ? `${baseUrl}/firms/update/${editingId}`
      : `${baseUrl}/firms`;

    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, subunits }),
    });

    const msg = await res.text();
    alert(msg);
    resetForm();
    loadFirms();
  });
});

function addSubunit() {
  const input = document.getElementById("subunitInput");
  const value = input.value.trim();
  if (value) {
    subunits.push(value);
    const li = document.createElement("li");
    li.textContent = value;
    document.getElementById("subunitList").appendChild(li);
    input.value = "";
  }
}
window.addSubunit = addSubunit;

async function loadFirms() {
  const res = await fetch(`${baseUrl}/firms/list`);
  const firms = await res.json();

  const tbody = document.querySelector("#firmTable tbody");
  tbody.innerHTML = "";
  firms.forEach((firm) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${firm.id}</td>
      <td>${firm.name}</td>
      <td>${firm.subunits.join(", ")}</td>
      <td>
        <button onclick="editFirm('${firm.id}')">Düzenle</button>
        <button onclick="deleteFirm('${firm.id}')">Sil</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function editFirm(id) {
  const res = await fetch(`${baseUrl}/firms/list`);
  const firms = await res.json();
  const firm = firms.find((f) => f.id === id);
  if (!firm) return alert("Firma bulunamadı.");

  document.getElementById("name").value = firm.name;
  subunits = [...firm.subunits];

  const list = document.getElementById("subunitList");
  list.innerHTML = "";
  subunits.forEach((s) => {
    const li = document.createElement("li");
    li.textContent = s;
    list.appendChild(li);
  });

  document.getElementById("firmForm").dataset.editingId = id;
}
window.editFirm = editFirm;

async function deleteFirm(id) {
  if (!confirm("Bu firmayı silmek istiyor musunuz?")) return;

  const res = await fetch(`${baseUrl}/firms/delete/${id}`, {
    method: "DELETE",
  });
  const msg = await res.text();
  alert(msg);
  loadFirms();
}
window.deleteFirm = deleteFirm;

function resetForm() {
  const form = document.getElementById("firmForm");
  form.reset();
  subunits = [];
  document.getElementById("subunitList").innerHTML = "";
  delete form.dataset.editingId;
}
