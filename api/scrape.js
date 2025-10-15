import { parse } from 'node-html-parser';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  try {
    const BASE_URL = 'https://www.tourmag.com/welcometothetravel/';
    const allOffers = [];
    let pageCount = 0;
    const maxPages = 20;
    
    while (pageCount < maxPages) {
      const start = pageCount * 10;
      const url = pageCount === 0 ? BASE_URL : `${BASE_URL}?start=${start}`;
      
      console.log(`Chargement page ${pageCount + 1}: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        }
      });
      
      if (!response.ok) {
        console.error(`Erreur HTTP ${response.status}`);
        break;
      }
      
      const html = await response.text();
      const root = parse(html);
      
      
      // Cibler uniquement les offres dans le bloc avec l'ID spécifique
      const offerBlock = root.querySelector('#mod_38716852');
      
      if (!offerBlock) {
        console.log('Bloc d\'offres non trouvé');
        break;
      }
      
      const offerElements = offerBlock.querySelectorAll('div.cel1');
      
      console.log(`Page ${pageCount + 1}: ${offerElements.length} éléments cel1 trouvés`);
      
      if (offerElements.length === 0) {
        console.log('Aucune offre trouvée, arrêt du scraping');
        break;
      }
      
      offerElements.forEach(element => {
        // Récupérer le lien <a> à l'intérieur
        const link = element.querySelector('a');
        
        if (link) {
          const href = link.getAttribute('href');
          const title = link.text.trim();
          
          if (href && title) {
            // Construire l'URL complète
            let fullUrl = href;
            if (!href.startsWith('http')) {
              fullUrl = href.startsWith('/') 
                ? `https://www.tourmag.com${href}` 
                : `https://www.tourmag.com/${href}`;
            }
            
            // Vérifier si l'offre n'est pas déjà dans la liste
            if (!allOffers.find(o => o.link === fullUrl)) {
              // Chercher la date dans l'élément parent ou voisin
              let date = '';
              const parentElement = element.parentNode;
              if (parentElement) {
                const dateElement = parentElement.querySelector('.date, .cel2, [class*="date"]');
                if (dateElement) {
                  date = dateElement.text.trim();
                }
              }
              
              allOffers.push({
                title: title,
                link: fullUrl,
                description: '',
                pubDate: date || 'Non précisée'
              });
            }
          }
        }
      });
      
      pageCount++;
      
      // Pause pour ne pas surcharger le serveur
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
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
