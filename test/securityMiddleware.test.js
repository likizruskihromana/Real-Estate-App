const test = require('node:test');
const assert = require('node:assert/strict');
const { requireAuth, requireAdmin } = require('../server/middleware/auth');
const { loginRateLimit } = require('../server/middleware/loginRateLimit');
const { csrfProtection } = require('../server/middleware/csrf');
const validacija = require('../server/utils/validation');
const { apiNotFound, errorHandler } = require('../server/middleware/errors');
const pagination = require('../server/utils/pagination');

function responseMock() {
  return {
    statusCode: 200,
    body: null,
    headers: {},
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    setHeader(name, value) { this.headers[name] = value; },
    cookie(name, value) { this.headers['Set-Cookie'] = `${name}=${value}`; },
  };
}

test('requireAuth odbija zahtjev bez prijavljene sesije', () => {
  const res = responseMock();
  let nextPozvan = false;
  requireAuth({ session: {} }, res, () => { nextPozvan = true; });
  assert.equal(res.statusCode, 401);
  assert.equal(nextPozvan, false);
});

test('CSRF zaštita odbija unsafe zahtjev bez odgovarajućeg headera', () => {
  const res = responseMock();
  const req = {
    method: 'POST',
    headers: { cookie: 'nekretnine.csrf=poznati-token' },
    get() { return undefined; },
  };
  csrfProtection(req, res, () => assert.fail('nevažeći zahtjev ne smije proći'));
  assert.equal(res.statusCode, 403);
});

test('CSRF zaštita prihvata jednak cookie i header token', () => {
  const res = responseMock();
  const req = {
    method: 'DELETE',
    headers: { cookie: 'nekretnine.csrf=poznati-token' },
    get(name) { return name === 'X-CSRF-Token' ? 'poznati-token' : undefined; },
  };
  let nextPozvan = false;
  csrfProtection(req, res, () => { nextPozvan = true; });
  assert.equal(nextPozvan, true);
});

test('validacija odbija prazne i predugačke korisničke tekstove', () => {
  assert.throws(() => validacija.tekst('   ', 'Komentar'), /obavezan|između/);
  assert.throws(() => validacija.tekst('x'.repeat(2001), 'Komentar'), /između/);
  assert.equal(validacija.tekst('  validno  ', 'Komentar'), 'validno');
});

test('validacija odbija neispravne ID i numeričke vrijednosti', () => {
  assert.throws(() => validacija.pozitivanId('../1'), /pozitivan cijeli broj/);
  assert.throws(() => validacija.pozitivanBroj('NaN', 'Cijena'), /pozitivan broj/);
  assert.equal(validacija.pozitivanId('12'), 12);
});

test('nepoznata API ruta vraća strukturisani 404 odgovor', () => {
  const res = responseMock();
  apiNotFound({ requestId: 'req-404' }, res);
  assert.equal(res.statusCode, 404);
  assert.equal(res.body.requestId, 'req-404');
});

test('centralni handler pretvara neispravan JSON u 400', () => {
  const res = responseMock();
  const error = new SyntaxError('Unexpected token');
  error.status = 400;
  error.body = '{';
  errorHandler(error, { requestId: 'req-json' }, res, () => {});
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.requestId, 'req-json');
});

test('paginacija ograničava limit i računa metapodatke', () => {
  const parametri = pagination.parametri({ page: '2', limit: '500' });
  assert.deepEqual(parametri, { enabled: true, page: 2, limit: 100, offset: 100 });
  const body = pagination.odgovor([{ id: 1 }], 205, parametri);
  assert.equal(body.pagination.totalPages, 3);
  assert.equal(body.pagination.totalItems, 205);
});

test('paginacija ostaje isključena za stare API pozive', () => {
  assert.deepEqual(pagination.parametri({}), { enabled: false });
});

test('requireAdmin odbija običnog prijavljenog korisnika', () => {
  const res = responseMock();
  requireAdmin({ session: { userId: 7, admin: false } }, res, () => assert.fail('next ne smije biti pozvan'));
  assert.equal(res.statusCode, 403);
});

test('login limiter blokira prekomjerne pokušaje po IP-u i usernameu', () => {
  const req = { ip: '192.0.2.10', body: { username: 'rate-limit-test' } };
  for (let i = 0; i < 10; i += 1) {
    const res = responseMock();
    let nextPozvan = false;
    loginRateLimit(req, res, () => { nextPozvan = true; });
    assert.equal(nextPozvan, true);
  }
  const blokiranRes = responseMock();
  loginRateLimit(req, blokiranRes, () => assert.fail('limitirani zahtjev ne smije proći'));
  assert.equal(blokiranRes.statusCode, 429);
  assert.ok(blokiranRes.headers['Retry-After'] > 0);
});
