const ApiService = {
    async fetchBahanAjar() {
        try {
            const response = await fetch('/data/dataBahanAjar.json');
            if (!response.ok) {
                throw new Error('Gagal memuat data basis data SITTA.');
            }
            return await response.json();
        } catch (error) {
            console.error("API Service Error:", error);
            return null;
        }
    }
};