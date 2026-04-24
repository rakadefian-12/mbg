// =====================
// DATA & STATE
// =====================
let data = JSON.parse(localStorage.getItem('mbgData') || '[]');
let editIndex = null;
let currentPage = 1;
const perPage = 10;

// =====================
// INIT
// =====================
document.addEventListener('DOMContentLoaded', () => {
    setTodayDate();
    setTopbarDate();
    updateDashboard();
    renderTable();
});

function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    const el = document.getElementById('formTanggal');
    if (el) el.value = today;
}

function setTopbarDate() {
    const el = document.getElementById('topbar-date');
    if (!el) return;
    const now = new Date();
    el.textContent = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function saveData() {
    localStorage.setItem('mbgData', JSON.stringify(data));
}

// =====================
// NAVIGATION
// =====================
function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    document.getElementById(page + 'Page').classList.add('active');
    document.getElementById('nav-' + page).classList.add('active');
    document.getElementById('topbar-title').textContent = page.charAt(0).toUpperCase() + page.slice(1);
    
    if (page === 'dashboard') updateDashboard();
    if (page === 'pesanan') renderTable();
}

// =====================
// DASHBOARD LOGIC
// =====================
function updateDashboard() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('totalData').textContent = data.length;
    document.getElementById('totalJumlah').textContent = data.reduce((s, d) => s + Number(d.jumlah || 0), 0);
    document.getElementById('hariIni').textContent = data.filter(d => d.tanggal === today).length;

    const recent = [...data].reverse().slice(0, 5);
    const tbody = document.getElementById('recentTable');
    tbody.innerHTML = recent.map(d => `
        <tr>
            <td>${d.tanggal}</td>
            <td>${d.nama}</td>
            <td>${d.pesanan}</td>
            <td><span style="color:#1a56db; font-weight:bold;">${d.jumlah}</span></td>
        </tr>
    `).join('');
}

// =====================
// PESANAN TABLE LOGIC
// =====================
function renderTable() {
    const query = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const filtered = data.filter(d => 
        d.nama.toLowerCase().includes(query) || 
        d.pesanan.toLowerCase().includes(query)
    );

    const tbody = document.getElementById('tableData');
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#9ca3af;">Tidak ada data</td></tr>`;
    } else {
        tbody.innerHTML = filtered.map((d, i) => `
            <tr>
                <td style="color:#9ca3af;">${i + 1}</td>
                <td>${d.tanggal}</td>
                <td style="font-weight:600;">${d.nama}</td>
                <td>${d.pesanan}</td>
                <td><span style="color:#1a56db; font-weight:bold;">${d.jumlah}</span></td>
                <td class="no-print">
                    <button onclick="editData(${data.indexOf(d)})" style="color:#1a56db; font-size:12px; margin-right:8px;">Edit</button>
                    <button onclick="hapusData(${data.indexOf(d)})" style="color:#dc2626; font-size:12px;">Hapus</button>
                </td>
            </tr>
        `).join('');
    }
    
    document.getElementById('paginationInfo').textContent = `Total: ${filtered.length} data`;
}

// =====================
// CRUD ACTIONS
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
    if (!confirm('Hapus pesanan ini?')) return;
    data.splice(index, 1);
    saveData();
    renderTable();
    updateDashboard();
}

function simpanForm() {
    const entry = {
        tanggal: document.getElementById('formTanggal').value,
        nama: document.getElementById('formNama').value,
        pesanan: document.getElementById('formPesanan').value,
        jumlah: document.getElementById('formJumlah').value
    };

    if (!entry.nama || !entry.pesanan || !entry.jumlah) {
        alert('Harap isi semua kolom!');
        return;
    }

    if (editIndex !== null) data[editIndex] = entry;
    else data.push(entry);

    saveData();
    tutupModal();
    renderTable();
    updateDashboard();
}

function bukaModal() { document.getElementById('modalForm').classList.add('open'); }
function tutupModal() { document.getElementById('modalForm').classList.remove('open'); }

// =====================
// EXPORT FUNCTIONS
// =====================
function exportExcel() {
    if (data.length === 0) return alert('Data kosong!');
    let csv = 'No,Tanggal,Nama,Pesanan,Jumlah\n';
    data.forEach((d, i) => {
        csv += `${i + 1},${d.tanggal},${d.nama},${d.pesanan},${d.jumlah}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MBG_Data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
}

function exportPDF() {
    if (data.length === 0) return alert('Data kosong!');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.text("Laporan Pesanan MBG", 14, 15);
    const rows = data.map((d, i) => [i + 1, d.tanggal, d.nama, d.pesanan, d.jumlah]);
    
    doc.autoTable({
        head: [['No', 'Tanggal', 'Nama', 'Pesanan', 'Jumlah']],
        body: rows,
        startY: 20,
        theme: 'grid'
    });
    
    doc.save(`Laporan_MBG_${new Date().toISOString().split('T')[0]}.pdf`);
}