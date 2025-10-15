// api/scrape.js - API Vercel Serverless Function
import { parse } from 'node-html-parser';

export default async function handler(req, res) {
  // Autoriser CORS pour que votre page HTML puisse appeler l'API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  try {
    const BASE_URL = 'https://www.tourmag.com/welcometothetravel/';
    const allOffers = [];
    let pageCount = 0;
    const maxPages = 15;
    
    // Boucle pour charger toutes les pages
    while (pageCount < maxPages) {
      const start = pageCount * 10;
      const url = pageCount === 0 ? BASE_URL : `${BASE_URL}?start=${start}`;
      
      console.log(`Chargement page ${pageCount + 1}: ${url}`);
      
      // Fetch de la page
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
      
      // Parser les offres
      const links = root.querySelectorAll('a');
      let foundOffers = 0;
      
      links.forEach(link => {
        const href = link.getAttribute('href');
        const text = link.text.trim();
        
        // Filtrer les liens qui ressemblent à des annonces
        if (href && text && text.length > 10 &&
            (href.includes('_a') || href.includes('/annonces/'))) {
          
          // Éviter navigation
          if (text.toLowerCase().includes('suivant') ||
              text.toLowerCase().includes('précédent') ||
              text.toLowerCase().includes('page')) {
            return;
          }
          
          // Construire URL complète
          let fullUrl = href;
          if (!href.startsWith('http')) {
            fullUrl = href.startsWith('/') 
              ? `https://www.tourmag.com${href}` 
              : `https://www.tourmag.com/${href}`;
          }
          
          // Vérifier si pas déjà dans la liste
          if (!allOffers.find(o => o.link === fullUrl)) {
            // Extraire contexte
            let description = '';
            let date = '';
            
            const parent = link.parentNode;
            if (parent) {
              const parentText = parent.text;
              const dateMatch = parentText.match(/(\d{1,2}\s+\w+|\d{1,2}\/\d{1,2}\/\d{4})/);
              if (dateMatch) date = dateMatch[0];
              description = parentText.replace(text, '').trim().substring(0, 200);
            }
            
            allOffers.push({
              title: text,
              link: fullUrl,
              description: description || '',
              pubDate: date || 'Non précisée'
            });
            
            foundOffers++;
          }
        }
      });
      
      console.log(`Page ${pageCount + 1}: ${foundOffers} offres trouvées`);
      
      // Si aucune offre trouvée, on arrête
      if (foundOffers === 0) {
        break;
      }
      
      pageCount++;
      
      // Pause pour ne pas surcharger le serveur
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`Total: ${allOffers.length} offres récupérées`);
    
    // Retourner les offres en JSON
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