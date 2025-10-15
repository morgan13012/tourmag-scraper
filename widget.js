(function() {
  'use strict';
  
  // Configuration du widget
  const WIDGET_CONFIG = {
    apiUrl: 'https://tourmag-scraper.vercel.app/api/scrape',
    containerId: 'tourmag-jobs-widget',
    styles: `
      .tmg-widget-container {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", "Roboto", sans-serif;
        background: #f8f9fa;
        padding: 2rem;
        border-radius: 12px;
      }
      
      .tmg-search-box {
        position: relative;
        margin-bottom: 1.5rem;
      }
      
      .tmg-search-box input {
        width: 100%;
        padding: 1rem 1rem 1rem 3rem;
        border: 2px solid #e0e0e0;
        border-radius: 10px;
        font-size: 1rem;
        box-sizing: border-box;
      }
      
      .tmg-search-box input:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
      }
      
      .tmg-search-icon {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: #999;
      }
      
      .tmg-filters {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
      }
      
      .tmg-filter-group select {
        width: 100%;
        padding: 0.8rem;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 0.95rem;
        background: white;
        cursor: pointer;
        box-sizing: border-box;
      }
      
      .tmg-stats {
        text-align: center;
        margin-bottom: 1.5rem;
        font-weight: 600;
        color: #2c3e50;
      }
      
      .tmg-results {
        display: grid;
        gap: 1.2rem;
      }
      
      .tmg-offer {
        background: white;
        border-radius: 10px;
        padding: 1.5rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        border-left: 4px solid #3498db;
        border: 1px solid #e8e8e8;
        border-left-width: 4px;
        transition: all 0.3s ease;
        position: relative;
      }
      
      .tmg-offer:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
      }
      
      .tmg-offer-badge {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
        color: white;
        padding: 0.3rem 0.8rem;
        border-radius: 20px;
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
      }
      
      .tmg-offer-title {
        font-weight: 600;
        font-size: 1.1rem;
        color: #1a202c;
        text-decoration: none;
        display: block;
        margin-bottom: 1rem;
        line-height: 1.6;
        padding-right: 4rem;
      }
      
      .tmg-offer-title:hover {
        color: #2563eb;
      }
      
      .tmg-offer-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #f0f0f0;
        color: #6c757d;
        font-size: 0.9rem;
      }
      
      .tmg-loading {
        text-align: center;
        padding: 3rem;
      }
      
      .tmg-spinner {
        border: 3px solid #f3f3f3;
        border-top: 3px solid #3498db;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: tmg-spin 1s linear infinite;
        margin: 0 auto 1rem;
      }
      
      @keyframes tmg-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .tmg-empty {
        text-align: center;
        padding: 3rem;
        color: #666;
      }
      
      .tmg-error {
        background: #ffe6e6;
        border: 2px solid #ff4444;
        color: #cc0000;
        padding: 1.5rem;
        border-radius: 12px;
        text-align: center;
      }
      
      @media (max-width: 768px) {
        .tmg-widget-container {
          padding: 1rem;
        }
        .tmg-filters {
          grid-template-columns: 1fr;
        }
      }
    `
  };
  
  // Injecter les styles
  const styleSheet = document.createElement('style');
  styleSheet.textContent = WIDGET_CONFIG.styles;
  document.head.appendChild(styleSheet);
  
  // Classe principale du widget
  class TourMagJobsWidget {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      if (!this.container) {
        console.error(`Container with ID "${containerId}" not found`);
        return;
      }
      
      this.allOffers = [];
      this.filteredOffers = [];
      this.locations = new Set();
      
      this.init();
    }
    
    init() {
      this.render();
      this.fetchOffers();
      this.setupEventListeners();
      
      // Auto-refresh toutes les 30 minutes
      setInterval(() => {
        this.fetchOffers();
      }, 30 * 60 * 1000);
    }
    
    render() {
      this.container.innerHTML = `
        <div class="tmg-widget-container">
          <div class="tmg-search-box">
            <span class="tmg-search-icon">🔍</span>
            <input type="text" id="tmg-search" placeholder="Rechercher une offre (intitulé, entreprise...)">
          </div>
          
          <div class="tmg-filters">
            <div class="tmg-filter-group">
              <select id="tmg-filter-contract">
                <option value="">Tous les contrats</option>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="Stage">Stage</option>
                <option value="Alternance">Alternance</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
            
            <div class="tmg-filter-group">
              <select id="tmg-filter-location">
                <option value="">Toutes les localisations</option>
              </select>
            </div>
          </div>
          
          <div class="tmg-stats" id="tmg-stats"></div>
          
          <div id="tmg-loading" class="tmg-loading">
            <div class="tmg-spinner"></div>
            <div>Chargement des offres...</div>
          </div>
          
          <div id="tmg-results" class="tmg-results"></div>
        </div>
      `;
    }
    
    async fetchOffers() {
      const loadingEl = document.getElementById('tmg-loading');
      const resultsEl = document.getElementById('tmg-results');
      
      if (loadingEl) loadingEl.style.display = 'block';
      if (resultsEl) resultsEl.innerHTML = '';
      
      try {
        const response = await fetch(WIDGET_CONFIG.apiUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        if (!data.success) throw new Error(data.error || 'Erreur inconnue');
        
        this.allOffers = data.offers;
        
        // Extraire localisations
        this.allOffers.forEach(offer => {
          const locationMatch = offer.title.match(/\(([^)]+)\)$/);
          if (locationMatch) this.locations.add(locationMatch[1]);
        });
        
        this.populateLocationFilter();
        
        if (loadingEl) loadingEl.style.display = 'none';
        
        this.updateStats(0, this.allOffers.length);
        this.showEmptyState();
        
      } catch (error) {
        console.error('Erreur:', error);
        if (loadingEl) loadingEl.style.display = 'none';
        if (resultsEl) {
          resultsEl.innerHTML = `
            <div class="tmg-error">
              <strong>❌ Erreur de chargement</strong><br>
              ${error.message}
            </div>
          `;
        }
      }
    }
    
    populateLocationFilter() {
      const select = document.getElementById('tmg-filter-location');
      if (!select) return;
      
      const sortedLocations = Array.from(this.locations).sort();
      sortedLocations.forEach(loc => {
        const option = document.createElement('option');
        option.value = loc;
        option.textContent = loc;
        select.appendChild(option);
      });
    }
    
    setupEventListeners() {
      const searchInput = document.getElementById('tmg-search');
      const contractFilter = document.getElementById('tmg-filter-contract');
      const locationFilter = document.getElementById('tmg-filter-location');
      
      if (searchInput) searchInput.addEventListener('input', () => this.applyFilters());
      if (contractFilter) contractFilter.addEventListener('change', () => this.applyFilters());
      if (locationFilter) locationFilter.addEventListener('change', () => this.applyFilters());
    }
    
    applyFilters() {
      const searchQuery = (document.getElementById('tmg-search')?.value || '').toLowerCase().trim();
      const contractFilter = document.getElementById('tmg-filter-contract')?.value || '';
      const locationFilter = document.getElementById('tmg-filter-location')?.value || '';
      
      this.filteredOffers = this.allOffers.filter(offer => {
        const matchesSearch = !searchQuery || offer.title.toLowerCase().includes(searchQuery);
        const matchesContract = !contractFilter || offer.title.includes(contractFilter);
        const matchesLocation = !locationFilter || offer.title.includes(locationFilter);
        
        return matchesSearch && matchesContract && matchesLocation;
      });
      
      this.updateStats(this.filteredOffers.length, this.allOffers.length);
      
      if (searchQuery || contractFilter || locationFilter) {
        this.renderOffers(this.filteredOffers);
      } else {
        this.showEmptyState();
      }
    }
    
    updateStats(filtered, total) {
      const statsEl = document.getElementById('tmg-stats');
      if (!statsEl) return;
      
      if (filtered === 0 && total > 0) {
        statsEl.innerHTML = `📊 <strong>${total}</strong> offres disponibles`;
      } else {
        statsEl.innerHTML = `📊 <strong>${filtered}</strong> offre(s) trouvée(s)`;
      }
    }
    
    showEmptyState() {
      const resultsEl = document.getElementById('tmg-results');
      if (!resultsEl) return;
      
      resultsEl.innerHTML = `
        <div class="tmg-empty">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
          <div>Utilisez les filtres ci-dessus pour rechercher des offres</div>
        </div>
      `;
    }
    
    renderOffers(offers) {
      const resultsEl = document.getElementById('tmg-results');
      if (!resultsEl) return;
      
      if (offers.length === 0) {
        resultsEl.innerHTML = `
          <div class="tmg-empty">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
            <div>Aucune offre ne correspond à vos critères</div>
          </div>
        `;
        return;
      }
      
      resultsEl.innerHTML = offers.map(offer => {
        const isNew = offer.pubDate.includes('NEW');
        const contractType = this.extractContractType(offer.title);
        const location = this.extractLocation(offer.title);
        
        return `
          <div class="tmg-offer">
            ${isNew ? '<div class="tmg-offer-badge">NOUVEAU</div>' : ''}
            <a href="${offer.link}" target="_blank" rel="noopener noreferrer" class="tmg-offer-title">
              ${offer.title}
            </a>
            <div class="tmg-offer-meta">
              <div>📝 <strong>Type:</strong> ${contractType}</div>
              <div>📍 <strong>Lieu:</strong> ${location}</div>
              <div>📅 <strong>Publié:</strong> ${offer.pubDate}</div>
            </div>
          </div>
        `;
      }).join('');
    }
    
    extractContractType(title) {
      if (title.includes('CDI')) return 'CDI';
      if (title.includes('CDD')) return 'CDD';
      if (title.includes('Stage')) return 'Stage';
      if (title.includes('Alternance')) return 'Alternance';
      return 'Non précisé';
    }
    
    extractLocation(title) {
      const match = title.match(/\(([^)]+)\)$/);
      return match ? match[1] : 'Non précisée';
    }
  }
  
  // Initialiser le widget quand le DOM est prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new TourMagJobsWidget(WIDGET_CONFIG.containerId);
    });
  } else {
    new TourMagJobsWidget(WIDGET_CONFIG.containerId);
  }
  
  // Exposer globalement pour permettre une initialisation personnalisée
  window.TourMagJobsWidget = TourMagJobsWidget;
})();