export default function handler(req, res) {
  // XML 형식으로 응답 설정
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  
  // sitemap XML 내용
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://renit.dokbun2.com/</loc>
    <lastmod>2023-10-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://renit.dokbun2.com/about</loc>
    <lastmod>2023-10-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://renit.dokbun2.com/services</loc>
    <lastmod>2023-10-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://renit.dokbun2.com/contact</loc>
    <lastmod>2023-10-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

  // 응답 전송
  res.status(200).send(sitemap);
} 