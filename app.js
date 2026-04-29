/**
 * Perfumatch - Fragrance Equivalency App
 * Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    let currentFilter = 'all';
    let searchQuery = '';
    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('results');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const installBtn = document.getElementById('installBtn');

    // Category mapping for readable titles
    const categoryLabels = {
        femme: "Colección Mujer",
        homme: "Colección Hombre",
        luxe: "Colección Lujo"
    };

    /**
     * Get all perfumes flattened with category info
     */
    function getAllPerfumes() {
        const all = [];
        for (const cat in perfumes) {
            perfumes[cat].forEach(p => {
                all.push({ ...p, categoryId: cat });
            });
        }
        return all;
    }

    /**
     * Filter and Search logic
     */
    function filterPerfumes() {
        const allPerfumes = getAllPerfumes();
        const query = searchQuery.toLowerCase().trim();

        return allPerfumes.filter(p => {
            // Filter by category
            let categoryMatch = true;
            if (currentFilter !== 'all') {
                if (currentFilter === 'luxe') {
                    categoryMatch = p.categoryId.startsWith('luxe');
                } else {
                    categoryMatch = p.categoryId === currentFilter;
                }
            }

            if (!categoryMatch) return false;

            // Search by name, brand, or number
            if (!query) return true;

            return (
                p.nombre.toLowerCase().includes(query) ||
                p.alama.toLowerCase().includes(query) ||
                p.numero.toLowerCase().includes(query)
            );
        });
    }

    /**
     * Render results to the DOM
     */
    function renderResults() {
        const filtered = filterPerfumes();
        resultsContainer.innerHTML = '';

        if (filtered.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <i>✨</i>
                    <h3>No se encontraron tesoros</h3>
                    <p>Prueba buscando por nombre, marca o el número que buscas.</p>
                </div>
            `;
            return;
        }

        // Sort by category if we are in 'all' or 'luxe'
        if (currentFilter === 'all' || currentFilter === 'luxe') {
            const grouped = {};
            filtered.forEach(p => {
                if (!grouped[p.categoryId]) grouped[p.categoryId] = [];
                grouped[p.categoryId].push(p);
            });

            // Display grouped results
            for (const catId in grouped) {
                const divider = document.createElement('div');
                divider.className = 'category-divider';
                divider.textContent = categoryLabels[catId] || catId;
                resultsContainer.appendChild(divider);

                grouped[catId].forEach(p => {
                    resultsContainer.appendChild(createPerfumeCard(p));
                });
            }
        } else {
            // Direct list
            filtered.forEach(p => {
                resultsContainer.appendChild(createPerfumeCard(p));
            });
        }
    }

    /**
     * Create a perfume card element
     */
    function createPerfumeCard(p) {
        const card = document.createElement('div');
        card.className = 'perfume-card';
        card.style.animationDelay = `${Math.random() * 0.2}s`;

        card.innerHTML = `
            <div class="perfume-info">
                <div class="perfume-name">${p.nombre}</div>
                <div class="perfume-brand">${p.alama}</div>
            </div>
            <div class="perfume-number-badge">
                <span class="badge-label">N°</span>
                <span class="badge-value">${p.numero}</span>
            </div>
        `;

        return card;
    }

    /**
     * Event Listeners
     */
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderResults();
    });

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderResults();
        });
    });

    // PWA Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(reg => console.log('SW Registered', reg))
                .catch(err => console.log('SW Registration Failed', err));
        });
    }

    // PWA Install Prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBtn.style.display = 'block';
    });

    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                installBtn.style.display = 'none';
            }
            deferredPrompt = null;
        }
    });

    // Initial Render
    renderResults();
});
