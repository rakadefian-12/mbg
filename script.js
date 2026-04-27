let data = JSON.parse(localStorage.getItem('mbgData') || '[]');
let editIndex = null;

// Fungsi Format Rupiah
const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(angka);
};

document.addEventListener('DOMContentLoaded', () => {
    updateDashboard();
    renderTable();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('topbar-date').textContent = new Date().toLocaleDateString('id-ID', options);
});

function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => {
        n.classList.remove('bg-slate-800', 'text-white');
        n.classList.add('text-slate-300');
    });
    
    document.getElementById(page + 'Page').classList.add('active');
    const activeNav = document.getElementById('nav-' + page);
    activeNav.classList.add('bg-slate-800', 'text-white');
    
    document.getElementById('topbar-title').textContent = page === 'dashboard' ? 'Dashboard Overview' : 'Manajemen Data Pesanan';
    if(page === 'dashboard') updateDashboard();
}

function updateDashboard() {
    const today = new Date().toISOString().split('T')[0];
    
    // Hitung Statistik
    const totalPorsi = data.reduce((s, d) => s + Number(d.jumlah || 0), 0);
    const totalDuit = data.reduce((s, d) => s + (Number(d.jumlah || 0) * Number(d.harga || 0)), 0);
    const hariIni = data.filter(d => d.tanggal === today).length;

    document.getElementById('stat-total-mbg').textContent = data.length;
    document.getElementById('stat-total-porsi').textContent = totalPorsi.toLocaleString('id-ID');
    document.getElementById('stat-total-duit').textContent = formatRupiah(totalDuit);
    document.getElementById('stat-hari-ini').textContent = hariIni;

    // Tabel Recent
    const recent = [...data].reverse().slice(0, 5);
    document.getElementById('recentTable').innerHTML = recent.map(d => `
        <tr class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-4 text-slate-500 font-medium">${d.tanggal}</td>
            <td class="px-6 py-4 font-bold text-slate-700">${d.nama}</td>
            <td class="px-6 py-4 text-slate-600">${d.pesanan}</td>
            <td class="px-6 py-4 font-bold text-blue-600">${d.jumlah} <span class="text-[10px] text-slate-400 font-normal">UNIT</span></td>
            <td class="px-6 py-4 font-bold text-emerald-600">${formatRupiah(d.jumlah * d.harga)}</td>
        </tr>
    `).join('');
}

function renderTable() {
    const query = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const filtered = data.filter(d => 
        d.nama.toLowerCase().includes(query) || 
        d.pesanan.toLowerCase().includes(query)
    );
    
    const tbody = document.getElementById('tableData');
    tbody.innerHTML = filtered.map((d, i) => {
        const subtotal = Number(d.jumlah || 0) * Number(d.harga || 0);
        return `
            <tr class="hover:bg-slate-50/80 transition-colors">
                <td class="px-6 py-4 text-slate-400 font-mono text-xs">${i + 1}</td>
                <td class="px-6 py-4 text-slate-600 font-medium">${d.tanggal}</td>
                <td class="px-6 py-4 font-bold text-slate-800">${d.nama}</td>
                <td class="px-6 py-4 text-slate-600">${d.pesanan}</td>
                <td class="px-6 py-4 text-slate-500">${formatRupiah(d.harga || 0)}</td>
                <td class="px-6 py-4 font-bold text-blue-600">${d.jumlah}</td>
                <td class="px-6 py-4 font-bold text-emerald-600">${formatRupiah(subtotal)}</td>
                <td class="px-6 py-4 no-print">
                    <div class="flex justify-center gap-2">
                        <button onclick="editData(${data.indexOf(d)})" class="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                        </button>
                        <button onclick="hapusData(${data.indexOf(d)})" class="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function tambahData() {
    editIndex = null;
    document.getElementById('modalTitle').textContent = 'Buat Pesanan Baru';
    document.getElementById('formNama').value = '';
    document.getElementById('formPesanan').value = '';
    document.getElementById('formJumlah').value = '';
    document.getElementById('formHarga').value = '';
    document.getElementById('formTanggal').value = new Date().toISOString().split('T')[0];
    
    const modal = document.getElementById('modalForm');
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.querySelector('.bg-white').classList.remove('scale-95');
}

function editData(index) {
    editIndex = index;
    const d = data[index];
    document.getElementById('modalTitle').textContent = 'Update Data Pesanan';
    document.getElementById('formTanggal').value = d.tanggal;
    document.getElementById('formNama').value = d.nama;
    document.getElementById('formPesanan').value = d.pesanan;
    document.getElementById('formJumlah').value = d.jumlah;
    document.getElementById('formHarga').value = d.harga || 0;
    
    const modal = document.getElementById('modalForm');
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.querySelector('.bg-white').classList.remove('scale-95');
}

function simpanForm() {
    const entry = {
        tanggal: document.getElementById('formTanggal').value,
        nama: document.getElementById('formNama').value,
        pesanan: document.getElementById('formPesanan').value,
        jumlah: Number(document.getElementById('formJumlah').value),
        harga: Number(document.getElementById('formHarga').value)
    };

    if(!entry.nama || entry.jumlah <= 0) return alert('Nama dan Jumlah harus valid!');
    
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

function tutupModal() { 
    const modal = document.getElementById('modalForm');
    modal.classList.add('opacity-0', 'pointer-events-none');
    modal.querySelector('.bg-white').classList.add('scale-95');
}

// EKSPOR (Sesuai Filter)
function exportPDF() {
    const query = document.getElementById('searchInput').value;
    const filteredData = data.filter(d => d.nama.toLowerCase().includes(query.toLowerCase()));
    if(filteredData.length === 0) return alert('Tidak ada data untuk diekspor!');
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('LAPORAN PENJUALAN MBG', 14, 15);
    doc.setFontSize(10);
    doc.text(`Filter: ${query || 'Semua'} | Dicetak pada: ${new Date().toLocaleString()}`, 14, 22);
    
    const rows = filteredData.map((d, i) => [
        i + 1, 
        d.tanggal, 
        d.nama, 
        d.pesanan, 
        d.jumlah, 
        formatRupiah(d.harga), 
        formatRupiah(d.jumlah * d.harga)
    ]);
    
    doc.autoTable({ 
        head: [['No', 'Tanggal', 'Nama MBG', 'Pesanan', 'Qty', 'Harga', 'Total']], 
        body: rows, 
        startY: 30,
        theme: 'striped',
        headStyles: { fillColor: [26, 86, 219] }
    });
    
    doc.save(`Laporan_MBG_${new Date().getTime()}.pdf`);
}

function exportExcel() {
    const query = document.getElementById('searchInput').value;
    const filteredData = data.filter(d => d.nama.toLowerCase().includes(query.toLowerCase()));
    let csv = 'No,Tanggal,Nama MBG,Pesanan,Harga Satuan,Jumlah,Total\n';
    filteredData.forEach((d, i) => { 
        csv += `${i+1},${d.tanggal},${d.nama},${d.pesanan},${d.harga},${d.jumlah},${d.harga * d.jumlah}\n`; 
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `Data_Export_${new Date().getTime()}.csv`; a.click();
}