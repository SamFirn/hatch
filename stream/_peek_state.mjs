/* READ-ONLY peek at the live stream pet. Connects as a passive 'overlay' listener and prints
   the first state broadcast it hears, then disconnects. Does NOT spawn a pet engine — never
   load pet.html to inspect state (that starts a SECOND engine and corrupts the real pet). */
const ws = new WebSocket('ws://localhost:8787');
let done = false;
ws.onopen = () => ws.send(JSON.stringify({ type: 'hello', role: 'overlay' }));
ws.onmessage = (m) => {
  const d = JSON.parse(m.data);
  if (d.type === 'init') console.log('INIT:', JSON.stringify({ mode: d.mode, skins: d.skins, defaultSkin: d.defaultSkin, speed: d.seasonSpeed, hof: (d.hof || []).length }));
  if (d.type === 'state') { console.log('STATE:', JSON.stringify(d, null, 1).slice(0, 1500)); done = true; ws.close(); }
};
ws.onerror = (e) => { console.log('ws error — is the stream running?'); process.exit(1); };
setTimeout(() => { if (!done) { console.log('no state broadcast in 12s'); ws.close(); } }, 12000);
