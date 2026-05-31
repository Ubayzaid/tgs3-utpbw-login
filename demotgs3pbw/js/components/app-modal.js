Vue.component('app-modal', {
    template: '#tpl-modal',
    data() {
        return { isOpen: false, title: '', message: '', isConfirm: false, onConfirmCallback: null };
    },
    methods: {
        open(title, message, isConfirm = false, onConfirm = null) {
            this.title = title; this.message = message; this.isConfirm = isConfirm;
            this.onConfirmCallback = onConfirm; this.isOpen = true;
        },
        confirm() {
            if (this.onConfirmCallback) this.onConfirmCallback();
            this.isOpen = false;
        },
        cancel() { this.isOpen = false; }
    }
});