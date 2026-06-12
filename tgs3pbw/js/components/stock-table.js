Vue.component('ba-stock-table', {
    template: '#tpl-stock',
    props: {
        items: { type: Array, required: true },
        upbjjList: { type: Array, required: true },
        kategoriList: { type: Array, required: true }
    },
    data() {
        return {
            filterUT: '',
            filterKategori: '',
            filterStatus: '',
            sortBy: 'judul',
            isEditing: false,
            validationError: '',
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
                if (this.sortBy === 'judul') return a.judul.localeCompare(b.judul);
                if (this.sortBy === 'qty') return a.qty - b.qty;
                if (this.sortBy === 'harga') return a.harga - b.harga;
                return 0;
            });
        }
    },
    watch: {
        filterUT(newVal) {
            
            this.filterKategori = '';
        }
    },
    methods: {
        resetFilters() {
            this.filterUT = ''; this.filterKategori = ''; this.filterStatus = ''; this.sortBy = 'judul';
        },
        startEdit(item) {
            this.isEditing = true; this.validationError = ''; this.form = { ...item };
        },
        cancelEdit() {
            this.isEditing = false; this.resetForm();
        },
        resetForm() {
            this.form = { kode: '', judul: '', kategori: '', upbjj: '', lokasiRak: '', harga: null, qty: null, safety: null, catatanHTML: '' };
        },
        validate() {
            if (!this.form.kode || !this.form.judul || !this.form.kategori || !this.form.upbjj || !this.form.lokasiRak) return 'Seluruh kolom teks wajib diisi lengkap.';
            if (this.form.harga === null || this.form.harga < 0) return 'Harga harus bernilai positif.';
            if (this.form.qty === null || this.form.qty < 0 || this.form.safety === null || this.form.safety < 0) return 'Kuantitas nilai stok tidak boleh negatif.';
            return '';
        },
        submitForm() {
            const err = this.validate();
            if (err) { this.validationError = err; return; }
            this.validationError = '';

            if (this.isEditing) {
                this.$emit('update-stock', { ...this.form });
                this.isEditing = false;
                this.$emit('trigger-alert', 'Sukses', 'Data Bahan Ajar berhasil di-update!');
            } else {
                if (this.items.some(x => x.kode.toUpperCase() === this.form.kode.toUpperCase())) {
                    this.validationError = 'Kode Mata Kuliah tersebut sudah terdaftar!';
                    return;
                }
                this.$emit('add-stock', { ...this.form });
                this.$emit('trigger-alert', 'Sukses', 'Bahan Ajar baru berhasil disimpan.');
            }
            this.resetForm();
        },
        confirmDelete(kode) {
            this.$emit('trigger-confirm', 'Konfirmasi Hapus', `Apakah Anda yakin ingin menghapus data materi ${kode}?`, () => {
                this.$emit('delete-stock', kode);
            });
        }
    }
});