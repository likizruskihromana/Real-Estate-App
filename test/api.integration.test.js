const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../server/app');

let server;
let baseUrl;

test.before(async () => {
  const app = createApp({ serveStatic: false });
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  const adresa = server.address();
  baseUrl = `http://127.0.0.1:${adresa.port}`;
});

test.after(async () => {
  if (server) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test('nepoznata API ruta vraća JSON 404 i request ID', async () => {
  const response = await fetch(`${baseUrl}/api/ne-postoji`);
  const body = await response.json();
  assert.equal(response.status, 404);
  assert.match(response.headers.get('content-type'), /application\/json/);
  assert.equal(body.requestId, response.headers.get('x-request-id'));
});

test('zaštićena ruta odbija anonimnog korisnika', async () => {
  const response = await fetch(`${baseUrl}/api/korisnik`);
  assert.equal(response.status, 401);
});

test('unsafe API zahtjev bez CSRF tokena se odbija prije kontrolera', async () => {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'x', password: 'x' }),
  });
  assert.equal(response.status, 403);
});

test('neispravan JSON dobija kontrolisan 400 odgovor', async () => {
  const initial = await fetch(`${baseUrl}/api/ne-postoji`);
  const setCookie = initial.headers.get('set-cookie');
  const csrfPar = setCookie.split(';')[0];
  const csrfToken = csrfPar.substring(csrfPar.indexOf('=') + 1);
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      cookie: csrfPar,
      'x-csrf-token': csrfToken,
    },
    body: '{',
  });
  const body = await response.json();
  assert.equal(response.status, 400);
  assert.ok(body.requestId);
});

test('sigurnosni headeri se šalju na API odgovorima', async () => {
  const response = await fetch(`${baseUrl}/api/ne-postoji`);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('x-frame-options'), 'SAMEORIGIN');
});
