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
            filterUT: '', filterStatus: '', sortBy: 'judul', 
            showModal: false, isEditing: false, validationError: '',
            form: { kode: '', judul: '', kategori: '', upbjj: '', lokasiRak: '', harga: null, qty: null, safety: null, catatanHTML: '' }
        };
    },
    computed: {
        filteredItems() {
            return this.items.filter(item => {
                const matchUT = !this.filterUT || item.upbjj === this.filterUT;
                let matchStat = true;
                if (this.filterStatus === 'kritis') matchStat = item.qty < item.safety;
                else if (this.filterStatus === 'kosong') matchStat = item.qty === 0;
                return matchUT && matchStat;
            });
        },
        sortedItems() {
            return [...this.filteredItems].sort((a, b) => a.judul.localeCompare(b.judul));
        }
    },
    methods: {
        resetFilters() { this.filterUT = ''; this.filterStatus = ''; },
        openAddModal() { this.isEditing = false; this.resetForm(); this.showModal = true; },
        startEdit(item) { this.isEditing = true; this.validationError = ''; this.form = { ...item }; this.showModal = true; },
        cancelEdit() { this.showModal = false; this.isEditing = false; this.resetForm(); },
        resetForm() { this.form = { kode: '', judul: '', kategori: '', upbjj: '', lokasiRak: '', harga: null, qty: null, safety: null, catatanHTML: '' }; },
        submitForm() {
            if (!this.form.kode || !this.form.judul) { this.validationError = 'Wajib diisi lengkap.'; return; }
            if (this.isEditing) {
                this.$emit('update-stock', { ...this.form });
                this.$emit('trigger-toast', 'Data Inventaris Diperbarui!');
            } else {
                this.$emit('add-stock', { ...this.form });
                this.$emit('trigger-toast', 'Materi Baru Terdaftar.');
            }
            this.showModal = false;
        },
        confirmDelete(kode) {
            this.$emit('trigger-confirm', 'Konfirmasi Hapus', `Hapus data materi ${kode}?`, () => { this.$emit('delete-stock', kode); });
        }
    }
});

Vue.component('do-tracking', {
    template: '#tpl-tracking',
    props: ['data'],
    data() { return { searchQuery: '', appliedSearch: '', selectedDOKey: '', showDetailModal: false, newProgressText: '', setAsSelesai: false }; },
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
        applySearch() { this.appliedSearch = this.searchQuery; },
        openTrackingDetail(key) { this.selectedDOKey = key; this.showDetailModal = true; },
        addProgressLog() {
            if (!this.newProgressText.trim()) return;
            const now = new Date();
            const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
            this.selectedDO.perjalanan.unshift({ waktu: timeStr, keterangan: this.newProgressText });
            if (this.setAsSelesai) this.selectedDO.status = 'Selesai';
            this.newProgressText = ''; this.setAsSelesai = false;
            this.$emit('trigger-toast', 'Tracking Status Updated!');
        }
    }
});

Vue.component('order-form', {
    template: '#tpl-order',
    props: ['paketList', 'ekspedisiList', 'trackingData'],
    data() { return { validationError: '', form: { nim: '', nama: '', ekspedisi: '', paketKode: '', tanggalManual: '' } }; },
    computed: {
        generatedDONumber() {
            const activeSequence = Object.keys(this.trackingData || {}).length + 1;
            return `DO2026-${String(activeSequence).padStart(3, '0')}`;
        },
        selectedPackage() { return this.paketList.find(p => p.kode === this.form.paketKode) || null; },
        displayPreviewDate() {
            if (this.form.tanggalManual) return new Date(this.form.tanggalManual).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
            return new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
        }
    },
    methods: {
        submitOrder() {
            if (!this.form.nim || !this.form.nama || !this.form.ekspedisi || !this.form.paketKode) {
                this.validationError = 'Lengkapi formulir registrasi!'; return;
            }
            const payload = {
                doNumber: this.generatedDONumber, nim: this.form.nim, nama: this.form.nama,
                ekspedisi: this.form.ekspedisi, paket: this.form.paketKode,
                total: this.selectedPackage ? this.selectedPackage.harga : 0, 
                tanggalKirim: this.displayPreviewDate
            };
            this.$emit('add-order', payload);
            this.$emit('trigger-toast', `Sukses! Dokumen ${payload.doNumber} Terdaftar.`);
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

const app = new Vue({
    el: '#app',
    data() {
        return {
            isLoggedIn: false, isLoading: false, showMobileNav: false, tab: 'dashboard',
            currentLocalTime: '', loadingText: '', authMode: 'login', userNIM: '053977558',
            loginForm: { email: 'admin@ut.ac.id', password: 'admin123' },
            registerForm: { nama: '', nim: '', email: '', password: '' },
            usersDatabase: [{ email: 'admin@ut.ac.id', password: 'admin123', nama: 'Administrator', nim: '053977558' }],
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
        currentLocalDate() { return new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); },
        greetingText() {
            const h = new Date().getHours();
            if (h >= 5 && h < 11) return 'Selamat pagi';
            if (h >= 11 && h < 15) return 'Selamat siang';
            if (h >= 15 && h < 18) return 'Selamat sore';
            return 'Selamat malam';
        }
    },
    async created() {
        try {
            const res = await fetch('/data/dataBahanAjar.json');
            this.state = await res.json();
            this.updateClock();
            setInterval(this.updateClock, 1000);
        } catch (e) { console.error("Data error."); }
    },
    methods: {
        updateClock() {
            this.currentLocalTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
        },
        handleLogin() {
            const user = this.usersDatabase.find(u => u.email.toLowerCase() === this.loginForm.email.toLowerCase() && u.password === this.loginForm.password);
            if (user) {
                this.loadingText = 'Menghubungkan Database UT...';
                this.isLoading = true; this.userNIM = user.nim;
                setTimeout(() => { this.isLoading = false; this.isLoggedIn = true; this.showToastNotification(`Selamat Datang, ${user.nama}!`); }, 1000);
            } else { this.triggerSimpleAlert('Login Gagal', 'Kredensial salah.'); }
        },
        handleRegister() {
            this.loadingText = 'Menyimpan Data Admin...'; this.isLoading = true;
            setTimeout(() => {
                this.usersDatabase.push({...this.registerForm});
                this.isLoading = false; this.authMode = 'login';
                this.loginForm.email = this.registerForm.email; this.loginForm.password = this.registerForm.password;
                this.showToastNotification('Registrasi Berhasil!');
            }, 1000);
        },
        handleLogout() {
            this.loadingText = 'Menutup Sesi...'; this.isLoading = true;
            setTimeout(() => { this.isLoading = false; this.isLoggedIn = false; }, 1000);
        },
        showToastNotification(msg) { this.toast.message = msg; this.toast.show = true; setTimeout(() => this.toast.show = false, 3000); },
        showForgotPasswordModal() { this.triggerSimpleAlert('Lupa Password', 'Hubungi Admin Pusat UT.'); },
        triggerSimpleAlert(title, message) { this.modalConfig = { isOpen: true, title, message, isConfirm: false, onConfirm: null }; },
        triggerConfirmModal(title, message, callback) { this.modalConfig = { isOpen: true, title, message, isConfirm: true, onConfirm: callback }; },
        handleNewStock(item) { this.state.stok.push(item); },
        handleDeleteStock(kode) { this.state.stok = this.state.stok.filter(x => x.kode !== kode); },
        handleUpdateStock(item) { const idx = this.state.stok.findIndex(x => x.kode === item.kode); if (idx !== -1) this.state.stok.splice(idx, 1, item); },
        handleNewOrder(payload) {
            this.$set(this.state.tracking, payload.doNumber, {
                nim: payload.nim, nama: payload.nama, status: 'Pengiriman', ekspedisi: payload.ekspedisi,
                paket: payload.paket, total: payload.total, tanggalKirim: payload.tanggalKirim,
                perjalanan: [{ waktu: new Date().toLocaleString(), keterangan: 'Paket didaftarkan di sistem.' }]
            });
        }
    }
});