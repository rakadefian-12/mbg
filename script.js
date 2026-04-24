// =====================
//  DATA & STATE
// =====================
let data = JSON.parse(localStorage.getItem('mbgData') || '[]');
let editIndex = null;
let currentPage = 1;
const perPage = 10;

// =====================
//  INIT
// =====================
document.addEventListener('DOMContentLoaded', () => {
  setTodayDate();
  setTopbarDate();
  updateDashboard();
  renderTable();
});

function setTodayDate() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('formTanggal').value = today;
}

function setTopbarDate() {
  const el = document.getElementById('topbar-date');
  if (!el) return;
  const now = new Date();
  const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  el.textContent = now.toLocaleDateString('id-ID', opts);
}

function saveData() {
  localStorage.setItem('mbgData', JSON.stringify(data));
}

// =====================
//  NAVIGATION
// =====================
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  document.getElementById(page + 'Page').classList.add('active');
  document.getElementById('nav-' + page).classList.add('active');

  const titles = { dashboard: 'Dashboard', pesanan: 'Pesanan' };
  document.getElementById('topbar-title').textContent = titles[page] || page;

  if (page === 'dashboard') updateDashboard();
  if (page === 'pesanan') renderTable();
}

// =====================
//  DASHBOARD
// =====================
function updateDashboard() {
  const today = new Date().toISOString().split('T')[0];

  document.getElementById('totalData').textContent = data.length;
  document.getElementById('totalJumlah').textContent = data.reduce((s, d) => s + Number(d.jumlah || 0), 0);
  document.getElementById('hariIni').textContent = data.filter(d => d.tanggal === today).length;

  renderRecentTable();
}

function renderRecentTable() {
  const tbody = document.getElementById('recentTable');
  if (!tbody) return;

  const recent = [...data].reverse().slice(0, 5);

  if (recent.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#9ca3af; padding:2rem;">Belum ada data pesanan</td></tr>`;
    return;
  }

  tbody.innerHTML = recent.map(d => `
    <tr>
      <td>${formatTanggal(d.tanggal)}</td>
      <td>${escHtml(d.nama)}</td>
      <td>${escHtml(d.pesanan)}</td>
      <td><span class="pill pill-blue">${d.jumlah}</span></td>
    </tr>
  `).join('');
}

// =====================
//  PESANAN TABLE
// =====================
function renderTable() {
  const query = (document.getElementById('searchInput')?.value || '').toLowerCase();

  const filtered = data.filter(d =>
    d.nama.toLowerCase().includes(query) ||
    d.pesanan.toLowerCase().includes(query) ||
    d.tanggal.includes(query)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  if (currentPage > totalPages) currentPage = 1;

  const start = (currentPage - 1) * perPage;
  const paged = filtered.slice(start, start + perPage);

  const tbody = document.getElementById('tableData');
  if (!tbody) return;

  if (paged.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#9ca3af; padding:2rem;">Tidak ada data ditemukan</td></tr>`;
  } else {
    tbody.innerHTML = paged.map((d, i) => {
      const realIndex = data.indexOf(d);
      return `
        <tr>
          <td style="color:#9ca3af;">${start + i + 1}</td>
          <td>${formatTanggal(d.tanggal)}</td>
          <td>${escHtml(d.nama)}</td>
          <td>${escHtml(d.pesanan)}</td>
          <td><span class="pill pill-blue">${d.jumlah}</span></td>
          <td>
            <button class="action-btn" onclick="editData(${realIndex})" title="Edit">
              <svg viewBox="0 0 24 24" fill="#6b7280"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
            </button>
            <button class="action-btn del" onclick="hapusData(${realIndex})" title="Hapus">
              <svg viewBox="0 0 24 24" fill="#6b7280"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Pagination info
  const info = document.getElementById('paginationInfo');
  if (info) info.textContent = `Menampilkan ${paged.length} dari ${filtered.length} data`;

  // Pagination buttons
  const btns = document.getElementById('paginationBtns');
  if (btns) {
    let html = '';
    if (currentPage > 1) html += `<div class="page-btn" onclick="goPage(${currentPage - 1})">&#8249;</div>`;
    for (let p = 1; p <= totalPages; p++) {
      if (totalPages <= 7 || (p <= 2 || p >= totalPages - 1 || Math.abs(p - currentPage) <= 1)) {
        html += `<div class="page-btn ${p === currentPage ? 'active' : ''}" onclick="goPage(${p})">${p}</div>`;
      } else if (p === 3 && currentPage > 4) {
        html += `<div class="page-btn" style="pointer-events:none;">…</div>`;
      } else if (p === totalPages - 2 && currentPage < totalPages - 3) {
        html += `<div class="page-btn" style="pointer-events:none;">…</div>`;
      }
    }
    if (currentPage < totalPages) html += `<div class="page-btn" onclick="goPage(${currentPage + 1})">&#8250;</div>`;
    btns.innerHTML = html;
  }
}

function goPage(p) {
  currentPage = p;
  renderTable();
}

// =====================
//  MODAL FORM
// =====================
function tambahData() {
  editIndex = null;
  document.getElementById('modalTitle').textContent = 'Tambah Pesanan';
  document.getElementById('formNama').value = '';
  document.getElementById('formPesanan').value = '';
  document.getElementById('formJumlah').value = '';
  setTodayDate();
  bukaModal();
}

function editData(index) {
  editIndex = index;
  const d = data[index];
  document.getElementById('modalTitle').textContent = 'Edit Pesanan';
  document.getElementById('formTanggal').value = d.tanggal;
  document.getElementById('formNama').value = d.nama;
  document.getElementById('formPesanan').value = d.pesanan;
  document.getElementById('formJumlah').value = d.jumlah;
  bukaModal();
}

function hapusData(index) {
  if (!confirm('Yakin ingin menghapus data ini?')) return;
  data.splice(index, 1);
  saveData();
  renderTable();
  updateDashboard();
}

function simpanForm() {
  const tanggal = document.getElementById('formTanggal').value.trim();
  const nama = document.getElementById('formNama').value.trim();
  const pesanan = document.getElementById('formPesanan').value.trim();
  const jumlah = Number(document.getElementById('formJumlah').value);

  if (!tanggal || !nama || !pesanan || !jumlah || jumlah < 1) {
    alert('Harap lengkapi semua field dengan benar!');
    return;
  }

  const entry = { tanggal, nama, pesanan, jumlah };

  if (editIndex !== null) {
    data[editIndex] = entry;
  } else {
    data.push(entry);
  }

  saveData();
  tutupModal();
  renderTable();
  updateDashboard();
}

function bukaModal() {
  document.getElementById('modalForm').classList.add('open');
}

function tutupModal() {
  document.getElementById('modalForm').classList.remove('open');
}

// Tutup modal kalau klik di luar
document.getElementById('modalForm').addEventListener('click', function(e) {
  if (e.target === this) tutupModal();
});

// =====================
//  EXPORT EXCEL
// =====================
function exportExcel() {
  if (data.length === 0) {
    alert('Tidak ada data untuk diekspor!');
    return;
  }

  let csv = 'No,Tanggal,Nama,Pesanan,Jumlah\n';
  data.forEach((d, i) => {
    csv += `${i + 1},${d.tanggal},${d.nama},${d.pesanan},${d.jumlah}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `MBG_Pesanan_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// =====================
//  HELPERS
// =====================
function formatTanggal(tanggal) {
  if (!tanggal) return '-';
  const d = new Date(tanggal + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
