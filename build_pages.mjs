// Wrap the editable fragment hatch.html into the deployable pages/index.html
// (adds the <!DOCTYPE html><html><head> … </head><body> … </body></html> scaffold).
import fs from 'fs';
const frag = fs.readFileSync('hatch.html', 'utf8').replace(/\r\n/g, '\n');
const splitMark = '<main class="stage">';
const idx = frag.indexOf(splitMark);
if (idx < 0) { console.error('ERROR: could not find body split marker'); process.exit(1); }
// find start of the line containing the marker
const lineStart = frag.lastIndexOf('\n', idx) + 1;
const head = frag.slice(0, lineStart).replace(/\s*$/, '\n');
const body = frag.slice(lineStart).replace(/\s*$/, '\n');
const out = `<!DOCTYPE html>\n<html lang="en">\n<head>\n${head}</head>\n<body>\n${body}</body>\n</html>\n`;
fs.writeFileSync('pages/index.html', out);
console.log('pages/index.html rebuilt:', out.split('\n').length, 'lines');

// SEO: robots + sitemap (regenerated here so they stay reproducible from this tracked script)
const BASE = 'https://hatchpet.pages.dev';
fs.writeFileSync('pages/robots.txt',
  `User-agent: *\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n`);
const today = new Date().toISOString().slice(0, 10);
const u = (loc, cf, pr) => `  <url><loc>${BASE}${loc}</loc><lastmod>${today}</lastmod><changefreq>${cf}</changefreq><priority>${pr}</priority></url>`;
fs.writeFileSync('pages/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  [u('/', 'weekly', '1.0'), u('/evotree', 'monthly', '0.5'), u('/feedback', 'monthly', '0.3')].join('\n') +
  `\n</urlset>\n`);
console.log('wrote pages/robots.txt + pages/sitemap.xml');
