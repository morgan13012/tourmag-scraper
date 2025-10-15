import { parse } from 'node-html-parser';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  try {
    const BASE_URL = 'https://www.tourmag.com/welcometothetravel/';
    const allOffers = [];
    const maxPages = 30; // Charger jusqu'à 30 pages (300 offres)
    
    // Charger toutes les pages en parallèle pour plus de rapidité
    const pagesToFetch = Array.from({ length: maxPages }, (_, i) => i);
    
    const fetchPromises = pagesToFetch.map(async (pageNum) => {
      const start = pageNum * 10;
      const url = pageNum === 0 ? BASE_URL : `${BASE_URL}?start=${start}`;
      
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
          }
        });
        
        if (!response.ok) return [];
        
        const html = await response.text();
        const root = parse(html);
        
        // Cibler uniquement les offres dans le bloc avec l'ID spécifique
        const offerBlock = root.querySelector('#mod_38716852');
        if (!offerBlock) return [];
        
        const offerElements = offerBlock.querySelectorAll('div.cel1');
        const pageOffers = [];
        
        offerElements.forEach(element => {
          const link = element.querySelector('a');
          
          if (link) {
            const href = link.getAttribute('href');
            const title = link.text.trim();
            
            if (href && title) {
              let fullUrl = href;
              if (!href.startsWith('http')) {
                fullUrl = href.startsWith('/') 
                  ? `https://www.tourmag.com${href}` 
                  : `https://www.tourmag.com/${href}`;
              }
              
              let date = '';
              const parentElement = element.parentNode;
              if (parentElement) {
                const dateElement = parentElement.querySelector('.date, .cel2, [class*="date"]');
                if (dateElement) {
                  date = dateElement.text.trim();
                }
              }
              
              pageOffers.push({
                title: title,
                link: fullUrl,
                description: '',
                pubDate: date || 'Non précisée'
              });
            }
          }
        });
        
        return pageOffers;
      } catch (error) {
        console.error(`Erreur page ${pageNum}:`, error);
        return [];
      }
    });
    
    const results = await Promise.all(fetchPromises);
    
    // Fusionner tous les résultats et dédupliquer
    results.forEach(pageOffers => {
      pageOffers.forEach(offer => {
        if (!allOffers.find(o => o.link === offer.link)) {
          allOffers.push(offer);
        }
      });
    });
    
    console.log(`Total: ${allOffers.length} offres récupérées`);
    
    res.status(200).json({
      success: true,
      total: allOffers.length,
      offers: allOffers,
      scrapedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Erreur scraping:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
