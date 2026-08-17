const test = require('node:test');
const assert = require('node:assert/strict');
const search = require('../server/utils/searchCriteria');
const { legacyReadOnly } = require('../server/middleware/legacyReadOnly');

test('search kriteriji normaliziraju dozvoljene filtere', () => {
  assert.deepEqual(search.parse({ lokacija:'  Sarajevo ',tip:'Stan',cijenaMax:'300000',parking:'true',nepoznato:'x' }),{lokacija:'Sarajevo',tip:'Stan',cijenaMax:300000,parking:true});
});

test('search kriteriji odbijaju neispravne raspone i enum vrijednosti', () => {
  assert.throws(()=>search.parse({tip:'Vila'}),error=>error.status===400&&error.code==='VALIDATION_ERROR');
  assert.throws(()=>search.parse({cijenaMin:500,cijenaMax:100}),/Minimalna cijena/);
});

test('fingerprint ne zavisi od redoslijeda kriterija niti sortiranja', () => {
  assert.equal(search.fingerprint({lokacija:'Mostar',tip:'Stan',sort:'najnovije'}),search.fingerprint({tip:'Stan',lokacija:'Mostar',sort:'cijena-asc'}));
});

test('alert matcher poštuje lokaciju, tip, cijenu i pogodnosti', () => {
  const property={lokacija:'Sarajevo, Centar',grad:'Sarajevo',tip_nekretnine:'Stan',namjena:'PRODAJA',cijena:250000,kvadratura:70,brojSoba:2,parking:true};
  assert.equal(search.matches(property,{lokacija:'centar',tip:'Stan',cijenaMax:300000,parking:true}),true);
  assert.equal(search.matches(property,{lokacija:'Mostar'}),false);
});

test('legacy komunikacijski upis vraća read-only grešku, a GET prolazi', () => {
  let nextCalled=false;legacyReadOnly({method:'GET'},{},()=>{nextCalled=true});assert.equal(nextCalled,true);
  let status,body;const res={status(value){status=value;return this},json(value){body=value;return this}};
  legacyReadOnly({method:'POST',requestId:'ignored'},res,()=>{});
  assert.equal(status,410);assert.equal(body.error.code,'LEGACY_READ_ONLY');
});
