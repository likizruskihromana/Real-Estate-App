const crypto = require('crypto');
const { Op } = require('sequelize');

const ALLOWED = {
  tip: new Set(['Stan', 'Kuća', 'Poslovni prostor']),
  namjena: new Set(['PRODAJA', 'NAJAM']),
  sort: new Set(['najnovije', 'cijena-asc', 'cijena-desc', 'kvadratura-desc']),
};
const booleanKeys = ['parking', 'balkon', 'lift'];
const numericKeys = ['cijenaMin', 'cijenaMax', 'kvadraturaMin', 'kvadraturaMax', 'sobeMin', 'kupatilaMin'];

function validation(message, field) {
  const error = new Error(message);
  error.status = 400;
  error.code = 'VALIDATION_ERROR';
  error.fieldErrors = { [field]: message };
  return error;
}

function parse(source = {}) {
  const result = {};
  for (const key of ['lokacija', 'namjestenost', 'stanje', 'energetskaKlasa']) {
    if (source[key] !== undefined && String(source[key]).trim()) result[key] = String(source[key]).trim().slice(0, 100);
  }
  for (const key of ['tip', 'namjena', 'sort']) {
    if (source[key] === undefined || source[key] === '') continue;
    if (!ALLOWED[key].has(String(source[key]))) throw validation(`Vrijednost filtera „${key}” nije dozvoljena.`, key);
    result[key] = String(source[key]);
  }
  for (const key of numericKeys) {
    if (source[key] === undefined || source[key] === '') continue;
    const value = Number(source[key]);
    if (!Number.isFinite(value) || value < 0) throw validation(`Filter „${key}” mora biti pozitivan broj.`, key);
    result[key] = value;
  }
  for (const key of booleanKeys) {
    if (source[key] === undefined || source[key] === '') continue;
    if (!['true', 'false', true, false, 1, 0, '1', '0'].includes(source[key])) throw validation(`Filter „${key}” nije validan.`, key);
    result[key] = ['true', true, 1, '1'].includes(source[key]);
  }
  if (source.dostupnoOd) {
    const date = /^\d{4}-\d{2}-\d{2}$/.test(String(source.dostupnoOd)) ? String(source.dostupnoOd) : null;
    if (!date) throw validation('Datum dostupnosti nije validan.', 'dostupnoOd');
    result.dostupnoOd = date;
  }
  if ((result.cijenaMin ?? 0) > (result.cijenaMax ?? Infinity)) throw validation('Minimalna cijena ne može biti veća od maksimalne.', 'cijenaMin');
  if ((result.kvadraturaMin ?? 0) > (result.kvadraturaMax ?? Infinity)) throw validation('Minimalna kvadratura ne može biti veća od maksimalne.', 'kvadraturaMin');
  return result;
}

function where(criteria, { bbox } = {}) {
  const result = { status: 'PUBLISHED', kupljeno: false };
  if (criteria.lokacija) result[Op.or] = ['lokacija', 'grad', 'naselje'].map(field => ({ [field]: { [Op.like]: `%${criteria.lokacija}%` } }));
  if (criteria.tip) result.tip_nekretnine = criteria.tip;
  if (criteria.namjena) result.namjena = criteria.namjena;
  if (criteria.namjestenost) result.namjestenost = criteria.namjestenost;
  if (criteria.stanje) result.stanje = criteria.stanje;
  if (criteria.energetskaKlasa) result.energetskaKlasa = criteria.energetskaKlasa;
  for (const key of booleanKeys) if (criteria[key] !== undefined) result[key] = criteria[key];
  const ranges = [['cijena', 'cijenaMin', 'cijenaMax'], ['kvadratura', 'kvadraturaMin', 'kvadraturaMax']];
  for (const [column, min, max] of ranges) if (criteria[min] !== undefined || criteria[max] !== undefined) result[column] = { ...(criteria[min] !== undefined ? { [Op.gte]: criteria[min] } : {}), ...(criteria[max] !== undefined ? { [Op.lte]: criteria[max] } : {}) };
  if (criteria.sobeMin !== undefined) result.brojSoba = { [Op.gte]: criteria.sobeMin };
  if (criteria.kupatilaMin !== undefined) result.brojKupatila = { [Op.gte]: criteria.kupatilaMin };
  if (criteria.dostupnoOd) result[Op.and] = [{ [Op.or]: [{ dostupnoOd: null }, { dostupnoOd: { [Op.lte]: criteria.dostupnoOd } }] }];
  if (bbox) {
    result.latPriblizno = { [Op.between]: [bbox.south, bbox.north] };
    result.lngPriblizno = { [Op.between]: [bbox.west, bbox.east] };
  }
  return result;
}

function order(sort = 'najnovije') {
  if (sort === 'cijena-asc') return [['cijena', 'ASC'], ['id', 'DESC']];
  if (sort === 'cijena-desc') return [['cijena', 'DESC'], ['id', 'DESC']];
  if (sort === 'kvadratura-desc') return [['kvadratura', 'DESC'], ['id', 'DESC']];
  return [['datum_objave', 'DESC'], ['id', 'DESC']];
}

function fingerprint(criteria) {
  const normalized = Object.fromEntries(Object.entries(criteria).filter(([key]) => key !== 'sort').sort(([a], [b]) => a.localeCompare(b)));
  return crypto.createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
}

function matches(property, criteria) {
  const text = `${property.lokacija || ''} ${property.grad || ''} ${property.naselje || ''}`.toLowerCase();
  if (criteria.lokacija && !text.includes(criteria.lokacija.toLowerCase())) return false;
  const exact = { tip: 'tip_nekretnine', namjena: 'namjena', namjestenost: 'namjestenost', stanje: 'stanje', energetskaKlasa: 'energetskaKlasa', parking: 'parking', balkon: 'balkon', lift: 'lift' };
  for (const [key, column] of Object.entries(exact)) if (criteria[key] !== undefined && property[column] !== criteria[key]) return false;
  const numbers = [['cijenaMin', 'cijena', v => Number(v) >= criteria.cijenaMin], ['cijenaMax', 'cijena', v => Number(v) <= criteria.cijenaMax], ['kvadraturaMin', 'kvadratura', v => Number(v) >= criteria.kvadraturaMin], ['kvadraturaMax', 'kvadratura', v => Number(v) <= criteria.kvadraturaMax], ['sobeMin', 'brojSoba', v => Number(v) >= criteria.sobeMin], ['kupatilaMin', 'brojKupatila', v => Number(v) >= criteria.kupatilaMin]];
  for (const [key, column, test] of numbers) if (criteria[key] !== undefined && !test(property[column])) return false;
  if (criteria.dostupnoOd && property.dostupnoOd && String(property.dostupnoOd) > criteria.dostupnoOd) return false;
  return true;
}

module.exports = { parse, where, order, fingerprint, matches };
