// Wrap the editable fragment hatch.html into the deployable pages/index.html
// (adds the <!DOCTYPE html><html><head> … </head><body> … </body></html> scaffold).
import fs from 'fs';
const frag = fs.readFileSync('hatch.html', 'utf8').replace(/\r\n/g, '\n');
const splitMark = '<div class="device" id="device"';
const idx = frag.indexOf(splitMark);
if (idx < 0) { console.error('ERROR: could not find body split marker'); process.exit(1); }
// find start of the line containing the marker
const lineStart = frag.lastIndexOf('\n', idx) + 1;
const head = frag.slice(0, lineStart).replace(/\s*$/, '\n');
const body = frag.slice(lineStart).replace(/\s*$/, '\n');
const out = `<!DOCTYPE html>\n<html lang="en">\n<head>\n${head}</head>\n<body>\n${body}</body>\n</html>\n`;
fs.writeFileSync('pages/index.html', out);
console.log('pages/index.html rebuilt:', out.split('\n').length, 'lines');
