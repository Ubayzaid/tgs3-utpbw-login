const ApiService = {
    async fetchBahanAjar() {
        try {
            // Mengambil dummy data dari file lokal JSON
            const response = await fetch('/data/dataBahanAjar.json');
            if (!response.ok) {
                throw new Error('Gagal memuat data basis data SITTA.');
            }
            return await response.json();
        } catch (error) {
            console.error("API Service Error:", error);
            // Fallback otomatis jika langsung dibuka tanpa server lokal (Live Server)
            return null;
        }
    }
};