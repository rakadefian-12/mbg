/**
 * MBG Dashboard Pro - Core Logic
 * Version: 3.0.0
 */

let data = JSON.parse(localStorage.getItem('mbgData') || '[]');
let editIndex = null;

// Helper: Format Mata Uang
const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(num || 0);
};

// Inisialisasi Aplikasi
document.addEventListener('DOMContentLoaded', () => {
    showPage('dashboard');
    updateClock();
});

function updateClock() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = new Date().toLocaleDateString('id-ID', options);
    document.getElementById('topbar-date').textContent = dateStr;
}

// Navigasi Antar Halaman
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById(pageId + 'Page')?.classList.remove('hidden');

    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('nav-' + pageId)?.classList.add('active');

    document.getElementById('topbar-title').textContent = pageId === 'dashboard' ? 'Overview' : 'Data Pesanan MBG';
    
    if(pageId === 'dashboard') updateDashboard();
    if(pageId === 'pesanan') renderTable();
}

// Logika Dashboard
function updateDashboard() {
    const totalPorsi = data.reduce((s, d) => s + (Number(d.jumlah) || 0), 0);
    const totalOmzet = data.reduce((s, d) => s + (Number(d.jumlah) * Number(d.harga) || 0), 0);
    const totalPiutang = data.filter(d => d.status !== 'Lunas')
                             .reduce((s, d) => s + (Number(d.jumlah) * Number(d.harga) || 0), 0);

    // Update Angka Statistik
    document.getElementById('stat-total-mbg').textContent = data.length;
    document.getElementById('stat-total-porsi').textContent = totalPorsi.toLocaleString('id-ID');
    document.getElementById('stat-total-duit').textContent = formatIDR(totalOmzet);
    document.getElementById('stat-piutang').textContent = formatIDR(totalPiutang);

    // Render Tabel Terakhir
    const recent = [...data].reverse().slice(0, 5);
    document.getElementById('recentTable').innerHTML = recent.map(d => `
        <tr class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-4 text-slate-500 font-medium">${d.tanggal || '-'}</td>
            <td class="px-6 py-4 font-bold text-slate-700">${d.nama || '-'}</td>
            <td class="px-6 py-4 text-slate-600">${d.pesanan || '-'}</td>
            <td class="px-6 py-4">
                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${d.status === 'Lunas' ? 'badge-lunas' : 'badge-pending'}">
                    ${d.status === 'Lunas' ? 'LUNAS' : 'BELUM BAYAR'}
                </span>
            </td>
            <td class="px-6 py-4 font-bold text-right text-slate-700">${formatIDR(d.jumlah * d.harga)}</td>
        </tr>
    `).join('');
}

// Logika Tabel Pesanan
function renderTable() {
    const query = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const filtered = data.filter(d => 
        (d.nama || '').toLowerCase().includes(query) || 
        (d.status || '').toLowerCase().includes(query) ||
        (d.pesanan || '').toLowerCase().includes(query)
    );
    
    document.getElementById('tableData').innerHTML = filtered.map((d, i) => {
        const subtotal = (Number(d.jumlah) || 0) * (Number(d.harga) || 0);
        const originalIndex = data.indexOf(d);
        return `
            <tr class="hover:bg-slate-50/80 transition-colors">
                <td class="px-6 py-4 text-slate-400 font-mono text-xs">${i + 1}</td>
                <td class="px-6 py-4 font-medium">${d.tanggal}</td>
                <td class="px-6 py-4 font-bold text-slate-800">${d.nama}</td>
                <td class="px-6 py-4 text-slate-600">${d.pesanan}</td>
                <td class="px-6 py-4 text-slate-500">${formatIDR(d.harga)}</td>
                <td class="px-6 py-4 font-bold text-indigo-600">${d.jumlah}</td>
                <td class="px-6 py-4 font-bold text-emerald-600">${formatIDR(subtotal)}</td>
                <td class="px-6 py-4 text-center">
                    <span class="px-3 py-1 rounded-full text-[10px] font-bold ${d.status === 'Lunas' ? 'badge-lunas' : 'badge-pending'}">
                        ${d.status || 'Belum Lunas'}
                    </span>
                </td>
                <td class="px-6 py-4 no-print">
                    <div class="flex justify-center gap-2">
                        <button onclick="editData(${originalIndex})" class="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                        </button>
                        <button onclick="hapusData(${originalIndex})" class="p-2 text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Fungsi Modal & Form
function openModal() {
    const modal = document.getElementById('modalForm');
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.querySelector('.bg-white').classList.remove('scale-95');
}

function tutupModal() {
    const modal = document.getElementById('modalForm');
    modal.classList.add('opacity-0', 'pointer-events-none');
    modal.querySelector('.bg-white').classList.add('scale-95');
}

function tambahData() {
    editIndex = null;
    document.getElementById('modalTitle').textContent = 'Buat Pesanan Baru';
    document.getElementById('formNama').value = '';
    document.getElementById('formPesanan').value = '';
    document.getElementById('formJumlah').value = '';
    document.getElementById('formHarga').value = '';
    document.getElementById('formStatus').value = 'Belum Lunas';
    document.getElementById('formTanggal').value = new Date().toISOString().split('T')[0];
    openModal();
}

function editData(index) {
    editIndex = index;
    const d = data[index];
    document.getElementById('modalTitle').textContent = 'Update Pesanan';
    document.getElementById('formTanggal').value = d.tanggal || '';
    document.getElementById('formNama').value = d.nama || '';
    document.getElementById('formPesanan').value = d.pesanan || '';
    document.getElementById('formJumlah').value = d.jumlah || '';
    document.getElementById('formHarga').value = d.harga || '';
    document.getElementById('formStatus').value = d.status || 'Belum Lunas';
    openModal();
}

function simpanForm() {
    const entry = {
        tanggal: document.getElementById('formTanggal').value,
        nama: document.getElementById('formNama').value.trim(),
        pesanan: document.getElementById('formPesanan').value.trim(),
        jumlah: Number(document.getElementById('formJumlah').value),
        harga: Number(document.getElementById('formHarga').value),
        status: document.getElementById('formStatus').value
    };

    if(!entry.nama || entry.jumlah <= 0) return alert('Mohon lengkapi data dengan benar!');
    
    if(editIndex !== null) data[editIndex] = entry;
    else data.push(entry);

    localStorage.setItem('mbgData', JSON.stringify(data));
    tutupModal(); renderTable(); updateDashboard();
}

function hapusData(index) {
    if(confirm('Yakin ingin menghapus permanen data ini?')) {
        data.splice(index, 1);
        localStorage.setItem('mbgData', JSON.stringify(data));
        renderTable(); updateDashboard();
    }
}

// Ekspor Laporan
function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const query = document.getElementById('searchInput').value;
    const filtered = data.filter(d => d.nama.toLowerCase().includes(query.toLowerCase()));
    
    doc.text('LAPORAN PENJUALAN MBG', 14, 15);
    doc.autoTable({
        head: [['No', 'Tanggal', 'Nama MBG', 'Menu', 'Qty', 'Total', 'Status']],
        body: filtered.map((d, i) => [i+1, d.tanggal, d.nama, d.pesanan, d.jumlah, formatIDR(d.jumlah * d.harga), d.status]),
        startY: 25
    });
    doc.save('Laporan_MBG.pdf');
}

function exportExcel() {
    const query = document.getElementById('searchInput').value;
    const filtered = data.filter(d => d.nama.toLowerCase().includes(query.toLowerCase()));
    let csv = 'No,Tanggal,Nama,Menu,Qty,Harga,Total,Status\n';
    filtered.forEach((d, i) => {
        csv += `${i+1},${d.tanggal},${d.nama},${d.pesanan},${d.jumlah},${d.harga},${d.jumlah*d.harga},${d.status}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'Data_MBG.csv'; a.click();
}