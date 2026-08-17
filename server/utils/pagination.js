function parametri(query = {}, { defaultLimit = 20, maxLimit = 100 } = {}) {
  const enabled = query.page !== undefined || query.limit !== undefined;
  if (!enabled) return { enabled: false };

  const trazenaStranica = Number.parseInt(query.page ?? '1', 10);
  const trazeniLimit = Number.parseInt(query.limit ?? String(defaultLimit), 10);
  const page = Number.isInteger(trazenaStranica) && trazenaStranica > 0 ? trazenaStranica : 1;
  const limit = Number.isInteger(trazeniLimit) && trazeniLimit > 0
    ? Math.min(trazeniLimit, maxLimit)
    : defaultLimit;

  return { enabled: true, page, limit, offset: (page - 1) * limit };
}

function odgovor(rows, count, pagination) {
  return {
    items: rows,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      totalItems: count,
      totalPages: Math.ceil(count / pagination.limit),
    },
  };
}

module.exports = { parametri, odgovor };

