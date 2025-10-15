const Storage = (() => {
    // Session storage wrapper (za frontend state)
    function setItem(key, value) {
        try {
            const data = JSON.stringify(value);
            sessionStorage.setItem(key, data);
        } catch (e) {
            console.error('Storage error:', e);
        }
    }

    function getItem(key) {
        try {
            const data = sessionStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Storage error:', e);
            return null;
        }
    }

    function removeItem(key) {
        sessionStorage.removeItem(key);
    }

    function clear() {
        sessionStorage.clear();
    }

    return {
        setItem,
        getItem,
        removeItem,
        clear
    };
})();