// 1. FORMATTING FILTERS
Vue.filter('formatCurrency', value => value ? 'Rp ' + value.toLocaleString('id-ID') : 'Rp 0');
Vue.filter('formatQuantity', value => value ? value + ' buah' : '0 buah');

// 2. VUE COMPONENTS DEFINITIONS
Vue.component('status-badge', {
    template: '#tpl-badge',
    props: ['qty', 'safety', 'catHtml'],
    computed: {
        badgeClass() {
            if (this.qty === 0) return 'bg-rose-500/15 text-rose-500 border border-rose-500/20';
            if (this.qty < this.safety) return 'bg-amber-500/15 text-amber-500 border border-amber-500/20';
            return 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20';
        },
        badgeIcon() {
            if (this.qty === 0) return 'fa-solid fa-circle-xmark';
            if (this.qty < this.safety) return 'fa-solid fa-triangle-exclamation';
            return 'fa-solid fa-circle-check';
        },
        badgeText() {
            if (this.qty === 0) return 'Kosong';
            if (this.qty < this.safety) return 'Menipis';
            return 'Aman';
        }
    }
});

Vue.component('ba-stock-table', {
    template: '#tpl-stock',
    props: ['items', 'upbjjList', 'kategoriList'],
    data() {
        return {
            filterUT: '', filterKategori: '', filterStatus: '', sortBy: 'judul', isEditing: false, validationError: '',
            form: { kode: '', judul: '', kategori: '', upbjj: '', lokasiRak: '', harga: null, qty: null, safety: null, catatanHTML: '' }
        };
    },
    computed: {
        filteredItems() {
            return this.items.filter(item => {
                const matchUT = !this.filterUT || item.upbjj === this.filterUT;
                const matchKat = !this.filterKategori || item.kategori === this.filterKategori;
                let matchStat = true;
                if (this.filterStatus === 'kritis') matchStat = item.qty < item.safety;
                else if (this.filterStatus === 'kosong') matchStat = item.qty === 0;
                return matchUT && matchKat && matchStat;
            });
        },
        sortedItems() {
            return [...this.filteredItems].sort((a, b) => {
                if (this.sortBy === 'qty') return a.qty - b.qty;
                if (this.sortBy === 'harga') return a.harga - b.harga;
                return a.judul.localeCompare(b.judul);
            });
        }
    },
    watch: {
        filterUT() { this.filterKategori = ''; }
    },
    methods: {
        resetFilters() { this.filterUT = ''; this.filterKategori = ''; this.filterStatus = ''; this.sortBy = 'judul'; },
        startEdit(item) { this.isEditing = true; this.validationError = ''; this.form = { ...item }; },
        cancelEdit() { this.isEditing = false; this.resetForm(); },
        resetForm() { this.form = { kode: '', judul: '', kategori: '', upbjj: '', lokasiRak: '', harga: null, qty: null, safety: null, catatanHTML: '' }; },
        submitForm() {
            if (!this.form.kode || !this.form.judul || !this.form.kategori || !this.form.upbjj) {
                this.validationError = 'Kolom utama wajib diisi lengkap.'; return;
            }
            if (this.isEditing) {
                this.$emit('update-stock', { ...this.form }); this.isEditing = false;
                this.$emit('trigger-toast', 'Data Berhasil Diperbarui!');
            } else {
                if (this.items.some(x => x.kode.toUpperCase() === this.form.kode.toUpperCase())) {
                    this.validationError = 'Kode mata kuliah sudah ada!'; return;
                }
                this.$emit('add-stock', { ...this.form });
                this.$emit('trigger-toast', 'Bahan Ajar Baru Berhasil Disimpan.');
            }
            this.resetForm();
        },
        confirmDelete(kode) {
            this.$emit('trigger-confirm', 'Konfirmasi Hapus', `Hapus data materi ${kode}?`, () => { this.$emit('delete-stock', kode); });
        }
    }
});

Vue.component('do-tracking', {
    template: '#tpl-tracking',
    props: ['data'],
    data() { return { searchQuery: '', appliedSearch: '', selectedDOKey: 'DO2026-001', newProgressText: '', setAsSelesai: false }; },
    computed: {
        searchResultKeys() {
            const query = this.appliedSearch.toLowerCase().trim();
            const keys = Object.keys(this.data);
            if (!query) return keys;
            return keys.filter(key => key.toLowerCase().includes(query) || this.data[key].nim.includes(query));
        },
        selectedDO() { return this.data[this.selectedDOKey] || null; }
    },
    methods: {
        getDOData(key) { return this.data[key]; },
        applySearch() { this.appliedSearch = this.searchQuery; this.selectedDOKey = this.searchResultKeys.length > 0 ? this.searchResultKeys[0] : ''; },
        clearSearch() { this.searchQuery = ''; this.appliedSearch = ''; this.selectedDOKey = Object.keys(this.data)[0] || ''; },
        addProgressLog() {
            if (!this.newProgressText.trim()) return;
            const now = new Date();
            const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
            this.selectedDO.perjalanan.unshift({ waktu: timeStr, keterangan: this.newProgressText });
            if (this.setAsSelesai) this.selectedDO.status = 'Selesai';
            this.newProgressText = ''; this.setAsSelesai = false;
            this.$emit('trigger-toast', 'Log Perjalanan Berhasil Diperbarui!');
        }
    }
});

Vue.component('order-form', {
    template: '#tpl-order',
    props: ['paketList', 'ekspedisiList'],
    data() { return { validationError: '', form: { nim: '', nama: '', ekspedisi: '', paketKode: '', tanggalManual: '' } }; },
    computed: {
        generatedDONumber() { return `DO2026-${Math.floor(Math.random() * 900) + 100}`; },
        selectedPackage() { return this.paketList.find(p => p.kode === this.form.paketKode) || null; },
        previewDate() { return new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }); },
        displayPreviewDate() {
            if (this.form.tanggalManual) {
                return new Date(this.form.tanggalManual).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
            }
            return this.previewDate;
        }
    },
    methods: {
        submitOrder() {
            if (!this.form.nim || !this.form.nama || !this.form.ekspedisi || !this.form.paketKode) {
                this.validationError = 'Wajib mengisi seluruh formulir!'; return;
            }
            this.validationError = '';
            const finalDate = this.form.tanggalManual ? 
                new Date(this.form.tanggalManual).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 
                this.previewDate;

            const payload = {
                doNumber: this.generatedDONumber, nim: this.form.nim, nama: this.form.nama,
                ekspedisi: this.form.ekspedisi, paket: this.form.paketKode,
                total: this.selectedPackage ? this.selectedPackage.harga : 0, tanggalKirim: finalDate
            };
            this.$emit('add-order', payload);
            this.$emit('trigger-toast', `Sukses! Delivery Order ${payload.doNumber} Berhasil Dibuat.`);
            this.form = { nim: '', nama: '', ekspedisi: '', paketKode: '', tanggalManual: '' };
        }
    }
});

Vue.component('app-modal', {
    template: '#tpl-modal',
    props: ['modalConfig'],
    methods: {
        confirm() { if (this.modalConfig.onConfirm) this.modalConfig.onConfirm(); this.modalConfig.isOpen = false; },
        cancel() { this.modalConfig.isOpen = false; }
    }
});

// 3. CORE VUE INSTANCE
const app = new Vue({
    el: '#app',
    data() {
        return {
            isLoggedIn: false, isLoading: false, showMobileNav: false, tab: 'dashboard',
            currentLocalTime: '',
            loginForm: { email: 'admin@ecampus.ut.ac.id', password: '12345' },
            state: { upbjjList: [], kategoriList: [], pengirimanList: [], paket: [], stok: [], tracking: {} },
            toast: { show: false, message: '' },
            modalConfig: { isOpen: false, title: '', message: '', isConfirm: false, onConfirm: null }
        };
    },
    computed: {
        totalQtySum() { return this.state.stok.reduce((acc, item) => acc + item.qty, 0); },
        criticalStockItems() { return this.state.stok.filter(item => item.qty < item.safety); },
        criticalStockItemsCount() { return this.criticalStockItems.length; },
        activeDOCount() { return Object.values(this.state.tracking).filter(d => d.status !== 'Selesai').length; },
        currentLocalDate() { return new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); }
    },
    async created() {
        try {
            const response = await fetch('/data/dataBahanAjar.json');
            this.state = await response.json();
            
            this.updateClock();
            setInterval(() => { this.updateClock(); }, 1000);
        } catch (e) {
            console.error("Gagal memuat JSON.");
        }
    },
    methods: {
        updateClock() {
            const now = new Date();
            this.currentLocalTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
        },
        handleLogin() {
            if (this.loginForm.email && this.loginForm.password === '12345') {
                // MENGAKTIFKAN SCREEN LOADING BARU
                this.isLoading = true;
                setTimeout(() => {
                    this.isLoading = false;
                    this.isLoggedIn = true;
                    this.showToastNotification('Login Berhasil! Selamat Datang di SITTA-UT.');
                }, 1000); // Durasi loading pas 1 detik agar transisinya pas
            } else {
                this.triggerSimpleAlert('Login Gagal', 'Email atau password salah! (Password default: 12345)');
            }
        },
        handleLogout() { this.isLoggedIn = false; this.tab = 'dashboard'; this.loginForm.password = ''; },
        showToastNotification(msg) {
            this.toast.message = msg;
            this.toast.show = true;
            setTimeout(() => { this.toast.show = false; }, 3000);
        },
        showForgotPasswordModal() { this.triggerSimpleAlert('Lupa Password', 'Silakan hubungi admin UT untuk reset password.'); },
        triggerSimpleAlert(title, message) {
            this.modalConfig = { isOpen: true, title, message, isConfirm: false, onConfirm: null };
        },
        triggerConfirmModal(title, message, callback) {
            this.modalConfig = { isOpen: true, title, message, isConfirm: true, onConfirm: callback };
        },
        handleNewStock(newItem) { this.state.stok.push(newItem); },
        handleDeleteStock(kode) { this.state.stok = this.state.stok.filter(x => x.kode !== kode); this.showToastNotification('Data Materi Terhapus.'); },
        handleUpdateStock(updatedItem) {
            const idx = this.state.stok.findIndex(x => x.kode === updatedItem.kode);
            if (idx !== -1) this.state.stok.splice(idx, 1, updatedItem);
        },
        handleNewOrder(payload) {
            this.$set(this.state.tracking, payload.doNumber, {
                nim: payload.nim, nama: payload.nama, status: 'Dalam Perjalanan', ekspedisi: payload.ekspedisi,
                paket: payload.paket, total: payload.total, tanggalKirim: payload.tanggalKirim,
                perjalanan: [{ waktu: new Date().toISOString().substring(0,10), keterangan: 'Penerimaan Paket Pusat UT' }]
            });
        }
    }
});