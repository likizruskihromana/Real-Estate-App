function tekst(value, naziv, { required = true, min = 1, max = 2000 } = {}) {
  if (value === undefined || value === null || value === '') {
    if (required) throw validationError(`${naziv} je obavezan.`);
    return null;
  }
  if (typeof value !== 'string') throw validationError(`${naziv} mora biti tekst.`);
  const cisto = value.trim();
  if (cisto.length < min || cisto.length > max) {
    throw validationError(`${naziv} mora imati između ${min} i ${max} karaktera.`);
  }
  return cisto;
}

function pozitivanBroj(value, naziv) {
  const broj = Number(value);
  if (!Number.isFinite(broj) || broj <= 0) throw validationError(`${naziv} mora biti pozitivan broj.`);
  return broj;
}

function pozitivanId(value, naziv = 'ID') {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw validationError(`${naziv} mora biti pozitivan cijeli broj.`);
  return id;
}

function boolean(value, naziv) {
  if (typeof value !== 'boolean') throw validationError(`${naziv} mora biti boolean vrijednost.`);
  return value;
}

function validationError(message) {
  const error = new Error(message);
  error.status = 400;
  error.code = 'VALIDATION_ERROR';
  return error;
}

function odgovoriNaGresku(error, res, context) {
  if (error.status === 400 || error.code === 'VALIDATION_ERROR') {
    return res.status(400).json({ greska: error.message });
  }
  console.error(context, error);
  return res.status(500).json({ greska: 'Internal Server Error' });
}

module.exports = { tekst, pozitivanBroj, pozitivanId, boolean, validationError, odgovoriNaGresku };

