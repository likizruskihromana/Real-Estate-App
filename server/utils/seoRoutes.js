const fs = require('fs/promises');
const path = require('path');
const { Op } = require('sequelize');
const { Nekretnina, SlikaNekretnine, Organizacija, Vodic, sequelize } = require('../models');
const config = require('../config/env');

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const absolute = value => value ? new URL(value, `${config.publicBaseUrl}/`).toString() : null;
const description = value => String(value || '').replace(/\s+/g, ' ').trim().slice(0, 160);
const safeJson = value => JSON.stringify(value).replace(/</g, '\\u003c');
const slugifySeo=value=>String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

async function renderShell(dist, meta) {
  let html = await fs.readFile(path.join(dist, 'index.html'), 'utf8');
  html = html.replace(/<title>.*?<\/title>/i, `<title>${esc(meta.title)}</title>`)
    .replace(/<meta name="description"[^>]*>/i, `<meta name="description" content="${esc(meta.description)}" />`);
  const tags = [`<link rel="canonical" href="${esc(meta.url)}" />`, `<meta property="og:type" content="${meta.type || 'website'}" />`, `<meta property="og:title" content="${esc(meta.title)}" />`, `<meta property="og:description" content="${esc(meta.description)}" />`, `<meta property="og:url" content="${esc(meta.url)}" />`, `<meta name="twitter:card" content="${meta.image ? 'summary_large_image' : 'summary'}" />`, `<meta name="twitter:title" content="${esc(meta.title)}" />`, `<meta name="twitter:description" content="${esc(meta.description)}" />`];
  if (meta.image) tags.push(`<meta property="og:image" content="${esc(meta.image)}" />`, `<meta name="twitter:image" content="${esc(meta.image)}" />`);
  if (meta.jsonLd) tags.push(`<script type="application/ld+json">${safeJson(meta.jsonLd)}</script>`);
  return html.replace('</head>', `${tags.join('\n')}\n</head>`);
}

function installSeoRoutes(app, dist) {
  const generic = (pathname,title,copy) => async (req,res,next) => { try { const url=`${config.publicBaseUrl}${pathname}`,image=absolute('/og.png');res.set('Cache-Control','public, max-age=300');res.send(await renderShell(dist,{title,description:copy,url,image,jsonLd:{'@context':'https://schema.org','@type':'WebSite',name:'Domus',url:config.publicBaseUrl,inLanguage:'bs-BA'}})); } catch(error){next(error)} };
  app.get('/',generic('/','Domus — Pravi dom. Jasniji put.','Provjerene nekretnine, jasna komunikacija i sigurniji put do pravog doma u Bosni i Hercegovini.'));
  app.get('/nekretnine',generic('/nekretnine','Nekretnine — Domus','Pretražite stanove, kuće i poslovne prostore za prodaju i najam širom Bosne i Hercegovine.'));
  app.get('/nekretnine/grad/:grad',async(req,res,next)=>{try{const name=description(req.params.grad.replace(/-/g,' ')),url=`${config.publicBaseUrl}/nekretnine/grad/${encodeURIComponent(req.params.grad)}`;res.send(await renderShell(dist,{title:`Nekretnine ${name} — Domus`,description:`Stanovi, kuće i poslovni prostori za prodaju i najam na području ${name}.`,url,jsonLd:{'@context':'https://schema.org','@type':'CollectionPage',name:`Nekretnine ${name}`,url}}))}catch(e){next(e)}});
  app.get('/nekretnine/tip/:tip',async(req,res,next)=>{try{const name=description(req.params.tip.replace(/-/g,' ')),url=`${config.publicBaseUrl}/nekretnine/tip/${encodeURIComponent(req.params.tip)}`;res.send(await renderShell(dist,{title:`${name} — Domus nekretnine`,description:`Pregledajte aktuelnu ponudu: ${name}.`,url,jsonLd:{'@context':'https://schema.org','@type':'CollectionPage',name,url}}))}catch(e){next(e)}});
  app.get('/nekretnine/:slug', async (req, res, next) => { try {
    const property = await Nekretnina.findOne({ where: { slug: req.params.slug, status: { [Op.in]: ['PUBLISHED','SOLD','RENTED','ARCHIVED'] } }, attributes: { exclude: ['punaAdresa','latTacno','lngTacno'] }, include: [{ model: SlikaNekretnine, as: 'Slike', where:{objavljena:true}, required:false, separate: true, limit: 1, order: [['glavna','DESC'],['redoslijed','ASC']] }] });
    if (!property) return next(); const image = absolute(property.Slike?.[0]?.largeUrl || property.Slike?.[0]?.url); const url = `${config.publicBaseUrl}/nekretnine/${encodeURIComponent(property.slug)}`;
    const meta = { title: `${property.naziv} — Domus`, description: description(property.opis || `${property.tip_nekretnine}, ${property.kvadratura} m², ${property.lokacija}.`), url, image, type: 'product', jsonLd: { '@context':'https://schema.org','@type':'RealEstateListing',name:property.naziv,description:description(property.opis),url,image:image?[image]:undefined,datePosted:property.datum_objave,address:{'@type':'PostalAddress',addressLocality:property.grad||property.lokacija,addressRegion:property.naselje||undefined,addressCountry:'BA'},offers:{'@type':'Offer',price:Number(property.cijena),priceCurrency:'BAM',availability:property.status==='PUBLISHED'?'https://schema.org/InStock':'https://schema.org/SoldOut'} } };
    res.set('Cache-Control','public, max-age=300');res.send(await renderShell(dist,meta));
  } catch(error){next(error)} });
  app.get('/agencije/:slug', async (req, res, next) => { try {
    const agency=await Organizacija.findOne({where:{slug:req.params.slug,status:'VERIFIED'},attributes:['naziv','slug','opis','grad','telefon','web']});if(!agency)return next();const url=`${config.publicBaseUrl}/agencije/${encodeURIComponent(agency.slug)}`;const meta={title:`${agency.naziv} — Domus`,description:description(agency.opis||`Verificirana agencija za nekretnine iz ${agency.grad||'Bosne i Hercegovine'}.`),url,jsonLd:{'@context':'https://schema.org','@type':'RealEstateAgent',name:agency.naziv,url,description:description(agency.opis),address:agency.grad?{'@type':'PostalAddress',addressLocality:agency.grad,addressCountry:'BA'}:undefined,telephone:agency.telefon||undefined,sameAs:agency.web?[agency.web]:undefined}};res.set('Cache-Control','public, max-age=300');res.send(await renderShell(dist,meta));
  }catch(error){next(error)} });
  app.get('/vodici/:slug',async(req,res,next)=>{try{const guide=await Vodic.findOne({where:{slug:req.params.slug,status:'PUBLISHED'},attributes:['naslov','sazetak','slug','objavljenoAt']});if(!guide)return next();const url=`${config.publicBaseUrl}/vodici/${encodeURIComponent(guide.slug)}`;res.send(await renderShell(dist,{title:`${guide.naslov} — Domus vodiči`,description:description(guide.sazetak),url,type:'article',jsonLd:{'@context':'https://schema.org','@type':'Article',headline:guide.naslov,description:guide.sazetak,datePublished:guide.objavljenoAt,url}}))}catch(e){next(e)}});
  app.get('/sitemap.xml', async (_req,res,next)=>{try{const [properties,agencies,guides,cities]=await Promise.all([Nekretnina.findAll({where:{status:{[Op.in]:['PUBLISHED','SOLD','RENTED','ARCHIVED']},slug:{[Op.ne]:null}},attributes:['slug','updatedAt']}),Organizacija.findAll({where:{status:'VERIFIED'},attributes:['slug','updatedAt']}),Vodic.findAll({where:{status:'PUBLISHED'},attributes:['slug','updatedAt']}),Nekretnina.findAll({where:{status:'PUBLISHED',grad:{[Op.ne]:null}},attributes:['grad'],group:['grad']})]);const urls=[{path:'/',updatedAt:null},{path:'/nekretnine',updatedAt:null},...properties.map(x=>({path:`/nekretnine/${encodeURIComponent(x.slug)}`,updatedAt:x.updatedAt})),...agencies.map(x=>({path:`/agencije/${encodeURIComponent(x.slug)}`,updatedAt:x.updatedAt})),...guides.map(x=>({path:`/vodici/${encodeURIComponent(x.slug)}`,updatedAt:x.updatedAt})),...cities.map(x=>({path:`/nekretnine/grad/${encodeURIComponent(slugifySeo(x.grad))}`,updatedAt:null}))];const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(x=>`<url><loc>${esc(config.publicBaseUrl+x.path)}</loc>${x.updatedAt?`<lastmod>${new Date(x.updatedAt).toISOString()}</lastmod>`:''}</url>`).join('')}</urlset>`;res.type('application/xml').send(xml)}catch(error){next(error)}});
  app.get('/robots.txt',(_req,res)=>res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /inbox\nDisallow: /profil\nSitemap: ${config.publicBaseUrl}/sitemap.xml\n`));
  app.get('/health',async(_req,res)=>{try{await sequelize.authenticate();res.json({status:'ok'})}catch{res.status(503).json({status:'unavailable'})}});
}

module.exports = { installSeoRoutes };
