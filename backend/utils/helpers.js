const Helpers = (() => {
    // Formatiranje datuma
    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}.`;
    }

    // Formatiranje cijene
    function formatPrice(price) {
        return new Intl.NumberFormat('bs-BA', {
            style: 'currency',
            currency: 'BAM'
        }).format(price);
    }

    // Debounce funkcija
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Validacija email-a
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Validacija passworda
    function isValidPassword(password) {
        return password && password.length >= 6;
    }

    // Show/Hide elementi
    function showElement(elementId) {
        const el = document.getElementById(elementId);
        if (el) el.style.display = 'block';
    }

    function hideElement(elementId) {
        const el = document.getElementById(elementId);
        if (el) el.style.display = 'none';
    }

    // Loading indicator
    function showLoading(container) {
        if (container) {
            container.innerHTML = '<div class="loading">Učitavanje...</div>';
        }
    }

    function hideLoading(container) {
        const loading = container?.querySelector('.loading');
        if (loading) loading.remove();
    }

    // Error handler
    function handleError(error, container) {
        console.error('Error:', error);
        if (container) {
            container.innerHTML = `<div class="error">Greška: ${error.statusText || 'Nepoznata greška'}</div>`;
        }
    }

    return {
        formatDate,
        formatPrice,
        debounce,
        isValidEmail,
        isValidPassword,
        showElement,
        hideElement,
        showLoading,
        hideLoading,
        handleError
    };
})();