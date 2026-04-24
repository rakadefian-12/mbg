let data = JSON.parse(localStorage.getItem('mbgData') || '[]');
let editIndex = null;

document.addEventListener('DOMContentLoaded', () => {
    updateDashboard();
    renderTable();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('topbar-date').textContent = new Date().toLocaleDateString('id-ID', options);
});

function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(page + 'Page').classList.add('active');
    document.getElementById('nav-' + page).classList.add('active');
    document.getElementById('topbar-title').textContent = page === 'dashboard' ? 'Dashboard' : 'Data Pesanan';
    if(page === 'dashboard') updateDashboard();
}

function updateDashboard() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('stat-total-mbg').textContent = data.length;
    document.getElementById('stat-total-porsi').textContent = data.reduce((s, d) => s + Number(d.jumlah || 0), 0);
    document.getElementById('stat-hari-ini').textContent = data.filter(d => d.tanggal === today).length;
    const recent = [...data].reverse().slice(0, 5);
    document.getElementById('recentTable').innerHTML = recent.map(d => `
        <tr><td>${d.tanggal}</td><td>${d.nama}</td><td>${d.pesanan}</td><td><b>${d.jumlah}</b></td></tr>
    `).join('');
}

function renderTable() {
    const query = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const filtered = data.filter(d => d.nama.toLowerCase().includes(query) || d.pesanan.toLowerCase().includes(query));
    const tbody = document.getElementById('tableData');
    
    tbody.innerHTML = filtered.map((d, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${d.tanggal}</td>
            <td style="font-weight:600;">${d.nama}</td>
            <td>${d.pesanan}</td>
            <td style="color:#1a56db; font-weight:bold;">${d.jumlah}</td>
            <td class="no-print" style="text-align:center;">
                <button onclick="editData(${data.indexOf(d)})" class="action-btn btn-edit-icon" title="Edit">
                    <svg style="width:18px;height:18px" viewBox="0 0 24 24"><path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" /></svg>
                </button>
                <button onclick="hapusData(${data.indexOf(d)})" class="action-btn btn-delete-icon" title="Hapus">
                    <svg style="width:18px;height:18px" viewBox="0 0 24 24"><path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19V4M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" /></svg>
                </button>
            </td>
        </tr>
    `).join('');
}

// Fitur Tambah/Simpan/Hapus (Tidak diubah)
function tambahData() {
    editIndex = null;
    document.getElementById('modalTitle').textContent = 'Tambah Pesanan';
    document.getElementById('formNama').value = '';
    document.getElementById('formPesanan').value = '';
    document.getElementById('formJumlah').value = '';
    document.getElementById('formTanggal').value = new Date().toISOString().split('T')[0];
    document.getElementById('modalForm').classList.add('open');
}

function editData(index) {
    editIndex = index;
    const d = data[index];
    document.getElementById('modalTitle').textContent = 'Edit Pesanan';
    document.getElementById('formTanggal').value = d.tanggal;
    document.getElementById('formNama').value = d.nama;
    document.getElementById('formPesanan').value = d.pesanan;
    document.getElementById('formJumlah').value = d.jumlah;
    document.getElementById('modalForm').classList.add('open');
}

function simpanForm() {
    const entry = {
        tanggal: document.getElementById('formTanggal').value,
        nama: document.getElementById('formNama').value,
        pesanan: document.getElementById('formPesanan').value,
        jumlah: document.getElementById('formJumlah').value
    };
    if(!entry.nama || !entry.jumlah) return alert('Data wajib diisi!');
    if(editIndex !== null) data[editIndex] = entry;
    else data.push(entry);
    localStorage.setItem('mbgData', JSON.stringify(data));
    tutupModal(); renderTable(); updateDashboard();
}

function hapusData(index) {
    if(confirm('Hapus data ini?')) {
        data.splice(index, 1);
        localStorage.setItem('mbgData', JSON.stringify(data));
        renderTable(); updateDashboard();
    }
}

function tutupModal() { document.getElementById('modalForm').classList.remove('open'); }

// Fitur Ekspor Tetap (Filter Berdasarkan Pencarian)
function exportPDF() {
    const query = document.getElementById('searchInput').value;
    const filteredData = data.filter(d => d.nama.toLowerCase().includes(query.toLowerCase()));
    if(filteredData.length === 0) return alert('Data kosong!');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text(`LAPORAN PESANAN: ${query.toUpperCase() || 'SEMUA'}`, 14, 15);
    const rows = filteredData.map((d, i) => [i + 1, d.tanggal, d.nama, d.pesanan, d.jumlah]);
    doc.autoTable({ head: [['No', 'Tanggal', 'Nama MBG', 'Pesanan', 'Jumlah']], body: rows, startY: 25 });
    doc.save(`Laporan_${query || 'MBG'}.pdf`);
}

function exportExcel() {
    const query = document.getElementById('searchInput').value;
    const filteredData = data.filter(d => d.nama.toLowerCase().includes(query.toLowerCase()));
    let csv = 'No,Tanggal,Nama MBG,Pesanan,Jumlah\n';
    filteredData.forEach((d, i) => { csv += `${i+1},${d.tanggal},${d.nama},${d.pesanan},${d.jumlah}\n`; });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `Data_${query || 'MBG'}.csv`; a.click();
}