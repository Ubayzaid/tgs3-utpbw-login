Vue.component('order-form', {
    template: '#tpl-order',
    props: { paketList: { type: Array, required: true }, ekspedisiList: { type: Array, required: true } },
    data() {
        return { validationError: '', form: { nim: '', nama: '', ekspedisi: '', paketKode: '' } };
    },
    computed: {
        generatedDONumber() {
            const year = new Date().getFullYear();
            return `DO${year}-${Math.floor(Math.random() * 900) + 100}`;
        },
        selectedPackage() { return this.paketList.find(p => p.kode === this.form.paketKode) || null; },
        previewDate() {
            return new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
        }
    },
    methods: {
        submitOrder() {
            if (!this.form.nim || !this.form.nama || !this.form.ekspedisi || !this.form.paketKode) {
                this.validationError = 'Wajib mengisi seluruh data formulir pemesanan!';
                return;
            }
            this.validationError = '';
            const payload = {
                doNumber: this.generatedDONumber, nim: this.form.nim, nama: this.form.nama,
                ekspedisi: this.form.ekspedisi, paket: this.form.paketKode,
                total: this.selectedPackage ? this.selectedPackage.harga : 0, tanggalKirim: this.previewDate
            };
            this.$emit('add-order', payload);
            this.form = { nim: '', nama: '', ekspedisi: '', paketKode: '' };
        }
    }
});