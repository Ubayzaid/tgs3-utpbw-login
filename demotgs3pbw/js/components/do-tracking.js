Vue.component('do-tracking', {
    template: '#tpl-tracking',
    props: { data: { type: Object, required: true } },
    data() {
        return { searchQuery: '', appliedSearch: '', selectedDOKey: 'DO2026-001', newProgressText: '', setAsSelesai: false };
    },
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
        applySearch() {
            this.appliedSearch = this.searchQuery;
            this.selectedDOKey = this.searchResultKeys.length > 0 ? this.searchResultKeys[0] : '';
        },
        clearSearch() {
            this.searchQuery = ''; this.appliedSearch = '';
            const keys = Object.keys(this.data);
            if (keys.length > 0) this.selectedDOKey = keys[0];
        },
        addProgressLog() {
            if (!this.newProgressText.trim()) {
                this.$emit('trigger-alert', 'Peringatan', 'Keterangan log perjalanan tidak boleh kosong.');
                return;
            }
            const now = new Date();
            const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
            
            this.selectedDO.perjalanan.unshift({ waktu: timeStr, keterangan: this.newProgressText });
            if (this.setAsSelesai) this.selectedDO.status = 'Selesai';
            
            this.newProgressText = ''; this.setAsSelesai = false;
            this.$emit('trigger-alert', 'Berhasil', 'Log perjalanan pengiriman DO berhasil diperbarui.');
        }
    }
});