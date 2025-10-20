(function() {
  'use strict';
  
  // Configuration du widget
  const WIDGET_CONFIG = {
    apiUrl: 'https://tourmag-scraper.vercel.app/api/scrape',
    containerId: 'tourmag-jobs-widget',
    styles: `
      .tmg-widget-container {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", "Roboto", "Helvetica Neue", Arial, sans-serif;
        background: #f8f9fa;
        padding: 2rem 1rem;
      }
      
      .tmg-search-section {
        background: white;
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        margin-bottom: 2rem;
        border: 1px solid #e8e8e8;
      }
      
      .tmg-search-title {
        font-size: 1.3rem;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
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
        transition: all 0.3s ease;
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
        font-size: 1.2rem;
      }
      
      .tmg-filters {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        margin-bottom: 1rem;
      }
      
      .tmg-filter-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      
      .tmg-filter-group label {
        font-weight: 600;
        color: #555;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .tmg-filter-group select {
        padding: 0.8rem;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 1rem;
        background: white;
        cursor: pointer;
        transition: all 0.3s ease;
        box-sizing: border-box;
      }
      
      .tmg-filter-group select:focus {
        outline: none;
        border-color: #3498db;
      }
      
      .tmg-filter-actions {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;
        flex-wrap: wrap;
      }
      
      .tmg-btn {
        padding: 0.7rem 1.5rem;
        border: none;
        border-radius: 8px;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .tmg-btn-secondary {
        background: #f0f0f0;
        color: #555;
      }
      
      .tmg-btn-secondary:hover {
        background: #e0e0e0;
      }
      
      .tmg-stats-bar {
        background: white;
        border-radius: 10px;
        padding: 1.2rem 1.5rem;
        margin-bottom: 2rem;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
        border: 1px solid #e8e8e8;
      }
      
      .tmg-stats-count {
        font-size: 1.1rem;
        font-weight: 600;
        color: #2c3e50;
      }
      
      .tmg-sort-options {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }
      
      .tmg-sort-options label {
        font-weight: 600;
        color: #555;
        font-size: 0.9rem;
      }
      
      .tmg-sort-options select {
        padding: 0.5rem 1rem;
        border: 2px solid #e0e0e0;
        border-radius: 6px;
        font-size: 0.95rem;
        cursor: pointer;
      }
      
      .tmg-last-update {
        text-align: center;
        color: #999;
        font-size: 0.85rem;
        margin-top: 0.5rem;
      }
      
      .tmg-results {
        display: grid;
        gap: 1.5rem;
      }
      
      .tmg-offer {
        background: white;
        border-radius: 10px;
        padding: 1.8rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        transition: all 0.3s ease;
        border: 1px solid #e8e8e8;
        border-left: 4px solid #3498db;
        position: relative;
      }
      
      .tmg-offer:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
        border-left-color: #2980b9;
      }
      
      .tmg-offer-badge {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
        color: white;
        padding: 0.4rem 0.9rem;
        border-radius: 20px;
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        box-shadow: 0 2px 8px rgba(39, 174, 96, 0.3);
      }
      
      .tmg-offer-title {
        font-family: "Segoe UI", "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
        font-weight: 600;
        font-size: 1.15rem;
        color: #1a202c;
        text-decoration: none;
        display: block;
        margin-bottom: 1rem;
        line-height: 1.6;
        padding-right: 5rem;
        transition: color 0.2s ease;
      }
      
      .tmg-offer-title:hover {
        color: #2563eb;
      }
      
      .tmg-offer-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 1.8rem;
        margin-top: 1.2rem;
        padding-top: 1rem;
        border-top: 1px solid #f0f0f0;
        color: #6c757d;
        font-size: 0.9rem;
      }
      
      .tmg-offer-meta-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .tmg-offer-meta-item strong {
        color: #495057;
        font-weight: 600;
      }
      
      .tmg-loading {
        text-align: center;
        padding: 4rem 2rem;
      }
      
      .tmg-spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: tmg-spin 1s linear infinite;
        margin: 0 auto 1rem;
      }
      
      .tmg-loading-text {
        color: #666;
        font-size: 1.1rem;
      }
      
      @keyframes tmg-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .tmg-empty-state {
        text-align: center;
        padding: 4rem 2rem;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      }
      
      .tmg-empty-state-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
      }
      
      .tmg-empty-state h3 {
        color: #333;
        margin-bottom: 0.5rem;
        font-size: 1.5rem;
      }
      
      .tmg-empty-state p {
        color: #666;
        font-size: 1.1rem;
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
        .tmg-search-section {
          padding: 1.2rem;
        }
        .tmg-filters {
          grid-template-columns: 1fr;
        }
        .tmg-stats-bar {
          flex-direction: column;
          align-items: flex-start;
        }
        .tmg-offer {
          padding: 1.2rem;
        }
        .tmg-offer-title {
          font-size: 1.1rem;
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
        console.log('Auto-refresh : rechargement des offres...');
        this.fetchOffers();
      }, 30 * 60 * 1000);
    }
    
    render() {
      this.container.innerHTML = `
        <div class="tmg-widget-container">
          <div class="tmg-search-section">
            <div class="tmg-search-title">
              🎯 Rechercher une offre
            </div>

            <div class="tmg-search-box">
              <span class="tmg-search-icon">🔍</span>
              <input type="text" id="tmg-search" placeholder="Intitulé du poste, entreprise, mots-clés...">
            </div>

            <div class="tmg-filters">
              <div class="tmg-filter-group">
                <label>📝 Type de contrat</label>
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
                <label>📍 Localisation</label>
                <select id="tmg-filter-location">
                  <option value="">Toutes les régions</option>
                </select>
              </div>

              <div class="tmg-filter-group">
                <label>📅 Date de publication</label>
                <select id="tmg-filter-date">
                  <option value="">Toutes les dates</option>
                  <option value="today">Aujourd'hui</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                </select>
              </div>
            </div>

            <div class="tmg-filter-actions">
              <button class="tmg-btn tmg-btn-secondary" onclick="window.tourmagWidget.clearFilters()">🔄 Réinitialiser les filtres</button>
            </div>
          </div>

          <div class="tmg-stats-bar" id="tmg-stats-bar" style="display: none;">
            <div class="tmg-stats-count" id="tmg-stats"></div>
            <div class="tmg-sort-options">
              <label>Trier par :</label>
              <select id="tmg-sort-by" onchange="window.tourmagWidget.applySorting()">
                <option value="date">Plus récent</option>
                <option value="alpha">Alphabétique</option>
              </select>
            </div>
          </div>
          <div class="tmg-last-update" id="tmg-last-update" style="display: none;"></div>
          
          <div id="tmg-loading" class="tmg-loading">
            <div class="tmg-spinner"></div>
            <div class="tmg-loading-text">Chargement des offres d'emploi...</div>
            <p style="color: #999; margin-top: 0.5rem;">Veuillez patienter quelques secondes</p>
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
        if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
        
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
        
        const statsBar = document.getElementById('tmg-stats-bar');
        if (statsBar) statsBar.style.display = 'flex';
        
        this.updateLastRefreshTime();
        
        if (this.allOffers.length === 0) {
          this.showEmptyState('Aucune offre disponible', 'Revenez plus tard pour voir les nouvelles offres.');
        } else {
          this.showEmptyState('Utilisez les filtres ci-dessus', 'Recherchez par mot-clé, type de contrat, localisation ou date pour trouver votre offre idéale.');
          this.updateStats(0, this.allOffers.length);
        }
        
      } catch (error) {
        console.error('Erreur:', error);
        if (loadingEl) loadingEl.style.display = 'none';
        if (resultsEl) {
          resultsEl.innerHTML = `
            <div class="tmg-error">
              <strong>❌ Erreur de chargement</strong><br><br>
              ${error.message}<br><br>
              <button class="tmg-btn tmg-btn-primary" onclick="window.tourmagWidget.fetchOffers()">Réessayer</button>
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
      const dateFilter = document.getElementById('tmg-filter-date');
      
      if (searchInput) searchInput.addEventListener('input', () => this.applyFilters());
      if (contractFilter) contractFilter.addEventListener('change', () => this.applyFilters());
      if (locationFilter) locationFilter.addEventListener('change', () => this.applyFilters());
      if (dateFilter) dateFilter.addEventListener('change', () => this.applyFilters());
    }
    
    applyFilters() {
      const searchQuery = (document.getElementById('tmg-search')?.value || '').toLowerCase().trim();
      const contractFilter = document.getElementById('tmg-filter-contract')?.value || '';
      const locationFilter = document.getElementById('tmg-filter-location')?.value || '';
      const dateFilter = document.getElementById('tmg-filter-date')?.value || '';
      
      this.filteredOffers = this.allOffers.filter(offer => {
        const matchesSearch = !searchQuery || offer.title.toLowerCase().includes(searchQuery);
        const matchesContract = !contractFilter || offer.title.includes(contractFilter);
        const matchesLocation = !locationFilter || offer.title.includes(locationFilter);
        
        let matchesDate = true;
        if (dateFilter === 'today') {
          matchesDate = offer.pubDate.includes('NEW') || offer.pubDate.includes(new Date().getDate());
        } else if (dateFilter === 'week') {
          matchesDate = offer.pubDate.includes('NEW') || offer.pubDate.includes('Octobre');
        }
        
        return matchesSearch && matchesContract && matchesLocation && matchesDate;
      });
      
      this.applySorting();
      this.updateStats(this.filteredOffers.length, this.allOffers.length);
      
      if (searchQuery || contractFilter || locationFilter || dateFilter) {
        this.renderOffers(this.filteredOffers);
      } else {
        this.showEmptyState('Utilisez les filtres ci-dessus', 'Recherchez par mot-clé, type de contrat, localisation ou date pour trouver votre offre idéale.');
      }
    }
    
    applySorting() {
      const sortBy = document.getElementById('tmg-sort-by')?.value || 'date';
      
      if (sortBy === 'alpha') {
        this.filteredOffers.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sortBy === 'date') {
        this.filteredOffers.sort((a, b) => {
          const aIsNew = a.pubDate.includes('NEW');
          const bIsNew = b.pubDate.includes('NEW');
          if (aIsNew && !bIsNew) return -1;
          if (!aIsNew && bIsNew) return 1;
          return 0;
        });
      }
      
      if (this.filteredOffers.length > 0) {
        this.renderOffers(this.filteredOffers);
      }
    }
    
    clearFilters() {
      const searchInput = document.getElementById('tmg-search');
      const contractFilter = document.getElementById('tmg-filter-contract');
      const locationFilter = document.getElementById('tmg-filter-location');
      const dateFilter = document.getElementById('tmg-filter-date');
      const sortBy = document.getElementById('tmg-sort-by');
      
      if (searchInput) searchInput.value = '';
      if (contractFilter) contractFilter.value = '';
      if (locationFilter) locationFilter.value = '';
      if (dateFilter) dateFilter.value = '';
      if (sortBy) sortBy.value = 'date';
      
      this.filteredOffers = [];
      this.updateStats(0, this.allOffers.length);
      this.showEmptyState('Filtres réinitialisés', 'Utilisez les filtres ci-dessus pour rechercher des offres.');
    }
    
    updateStats(filtered, total) {
      const statsEl = document.getElementById('tmg-stats');
      if (!statsEl) return;
      
      if (filtered === 0 && total > 0) {
        statsEl.innerHTML = `📊 <strong>${total}</strong> offres disponibles`;
      } else {
        statsEl.innerHTML = `📊 <strong>${filtered}</strong> offre(s) trouvée(s) sur <strong>${total}</strong>`;
      }
    }
    
    updateLastRefreshTime() {
      const now = new Date();
      const timeString = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const lastUpdateEl = document.getElementById('tmg-last-update');
      if (lastUpdateEl) {
        lastUpdateEl.textContent = `Dernière actualisation : ${timeString}`;
        lastUpdateEl.style.display = 'block';
      }
    }
    
    showEmptyState(title, message) {
      const resultsEl = document.getElementById('tmg-results');
      if (!resultsEl) return;
      
      resultsEl.innerHTML = `
        <div class="tmg-empty-state">
          <div class="tmg-empty-state-icon">🔍</div>
          <h3>${title}</h3>
          <p>${message}</p>
        </div>
      `;
    }
    
    renderOffers(offers) {
      const resultsEl = document.getElementById('tmg-results');
      if (!resultsEl) return;
      
      if (offers.length === 0) {
        this.showEmptyState('Aucune offre trouvée', 'Essayez de modifier vos critères de recherche.');
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
              <div class="tmg-offer-meta-item">
                <span>📝</span>
                <span><strong>Type :</strong> ${contractType}</span>
              </div>
              <div class="tmg-offer-meta-item">
                <span>📍</span>
                <span><strong>Lieu :</strong> ${location}</span>
              </div>
              <div class="tmg-offer-meta-item">
                <span>📅</span>
                <span><strong>Publié :</strong> ${offer.pubDate}</span>
              </div>
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
      if (title.includes('Freelance')) return 'Freelance';
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
      window.tourmagWidget = new TourMagJobsWidget(WIDGET_CONFIG.containerId);
    });
  } else {
    window.tourmagWidget = new TourMagJobsWidget(WIDGET_CONFIG.containerId);
  }
  
  // Exposer globalement
  window.TourMagJobsWidget = TourMagJobsWidget;
})();
