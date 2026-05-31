Vue.component('status-badge', {
    template: '#tpl-badge',
    props: {
        qty: { type: Number, required: true },
        safety: { type: Number, required: true },
        catHtml: { type: String, default: '' }
    },
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