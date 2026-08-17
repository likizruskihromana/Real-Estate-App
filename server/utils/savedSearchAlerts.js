const { SacuvanaPretraga, PodudaranjeSacuvanePretrage, Obavijest } = require('../models');
const hub = require('./notificationHub');
const { matches } = require('./searchCriteria');

async function notifySavedSearchMatches(property, { transaction } = {}) {
  const searches = await SacuvanaPretraga.findAll({ where: { alertsEnabled: true }, transaction });
  for (const search of searches) {
    const criteria = search.kriteriji || { lokacija: search.lokacija || undefined, tip: search.tip || undefined, cijenaMax: search.maxCijena ? Number(search.maxCijena) : undefined };
    if (!matches(property, criteria)) continue;
    const [, created] = await PodudaranjeSacuvanePretrage.findOrCreate({
      where: { SacuvanaPretragaId: search.id, NekretninaId: property.id },
      defaults: { SacuvanaPretragaId: search.id, NekretninaId: property.id },
      transaction,
    });
    if (!created) continue;
    const notification = await Obavijest.create({
      KorisnikId: search.KorisnikId,
      tip: 'SAVED_SEARCH_MATCH',
      naslov: 'Nova nekretnina za vašu pretragu',
      poruka: `Oglas „${property.naziv}” odgovara pretrazi „${search.naziv}”.`,
      link: `/nekretnine/${property.slug || property.id}`,
    }, { transaction });
    if (!transaction) hub.emit(`user:${search.KorisnikId}`, notification.toJSON());
    else transaction.afterCommit(() => hub.emit(`user:${search.KorisnikId}`, notification.toJSON()));
  }
}

module.exports = { notifySavedSearchMatches };
