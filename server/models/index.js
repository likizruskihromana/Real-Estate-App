const { Sequelize } = require('sequelize');
const config = require('../config/env');

const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    dialect: 'mysql',
    port: config.database.port,
    logging: false,
  }
);

const Korisnik = require('./Korisnik')(sequelize);
const Nekretnina = require('./Nekretnina')(sequelize);
const Upit = require('./Upit')(sequelize);
const Zahtjev = require('./Zahtjev')(sequelize);
const Ponuda = require('./Ponuda')(sequelize);
const Komentar = require('./Komentar')(sequelize); // <-- DODANO
const SlikaNekretnine = require('./SlikaNekretnine')(sequelize);
const OmiljenaNekretnina = require('./OmiljenaNekretnina')(sequelize);
const SacuvanaPretraga = require('./SacuvanaPretraga')(sequelize);
const v2 = require('./DomusV2')(sequelize);
const { Organizacija, ClanstvoOrganizacije, Razgovor, Poruka, TerminPregleda, PregovarackaPonuda, JavniFaq, Obavijest, ActivityEvent, AdminAuditLog, PrijavaSadrzaja, OglasRevizija } = v2;

// Veze
Korisnik.hasMany(Nekretnina);
Nekretnina.belongsTo(Korisnik);

Nekretnina.hasMany(Upit, { as: 'Upiti' });
Upit.belongsTo(Nekretnina);
Korisnik.hasMany(Upit, { as: 'Upiti' });
Upit.belongsTo(Korisnik);

Nekretnina.hasMany(Zahtjev, { as: 'Zahtjevi' });
Zahtjev.belongsTo(Nekretnina);
Korisnik.hasMany(Zahtjev, { as: 'Zahtjevi' });
Zahtjev.belongsTo(Korisnik);

Nekretnina.hasMany(Ponuda, { as: 'Ponude' });
Ponuda.belongsTo(Nekretnina);
Korisnik.hasMany(Ponuda, { as: 'Ponude' });
Ponuda.belongsTo(Korisnik);
Ponuda.hasMany(Ponuda, { as: 'VezanePonude', foreignKey: 'idVezanePonude' });
Ponuda.belongsTo(Ponuda, { as: 'RootPonuda', foreignKey: 'idVezanePonude' });

// --- NOVE VEZE ZA KOMENTARE ---
Nekretnina.hasMany(Komentar, { as: 'Komentari' });
Komentar.belongsTo(Nekretnina);

Korisnik.hasMany(Komentar, { as: 'Komentari' });
Komentar.belongsTo(Korisnik);

Komentar.hasMany(Komentar, { as: 'Odgovori', foreignKey: 'idVezanogKomentara' });
Komentar.belongsTo(Komentar, { as: 'GlavniKomentar', foreignKey: 'idVezanogKomentara' });

// Kupac nekretnine (postavlja se kad se prihvati ponuda)
Nekretnina.belongsTo(Korisnik, { as: 'Kupac', foreignKey: 'kupacId' });

Nekretnina.hasMany(SlikaNekretnine, { as: 'Slike', foreignKey: 'NekretninaId', onDelete: 'CASCADE' });
SlikaNekretnine.belongsTo(Nekretnina, { foreignKey: 'NekretninaId' });

Korisnik.belongsToMany(Nekretnina, {
  through: OmiljenaNekretnina,
  as: 'OmiljeneNekretnine',
  foreignKey: 'KorisnikId',
  otherKey: 'NekretninaId',
});
Nekretnina.belongsToMany(Korisnik, {
  through: OmiljenaNekretnina,
  as: 'Pratioci',
  foreignKey: 'NekretninaId',
  otherKey: 'KorisnikId',
});
OmiljenaNekretnina.belongsTo(Korisnik, { foreignKey: 'KorisnikId' });
OmiljenaNekretnina.belongsTo(Nekretnina, { foreignKey: 'NekretninaId' });
Korisnik.hasMany(SacuvanaPretraga, { as: 'SacuvanePretrage', foreignKey: 'KorisnikId', onDelete: 'CASCADE' });
SacuvanaPretraga.belongsTo(Korisnik, { foreignKey: 'KorisnikId' });

Organizacija.belongsTo(Korisnik, { as: 'Kreator', foreignKey: 'KreatorId' });
Organizacija.belongsToMany(Korisnik, { through: ClanstvoOrganizacije, as: 'Clanovi', foreignKey: 'OrganizacijaId', otherKey: 'KorisnikId' });
Korisnik.belongsToMany(Organizacija, { through: ClanstvoOrganizacije, as: 'Organizacije', foreignKey: 'KorisnikId', otherKey: 'OrganizacijaId' });
ClanstvoOrganizacije.belongsTo(Organizacija, { foreignKey: 'OrganizacijaId' });
ClanstvoOrganizacije.belongsTo(Korisnik, { foreignKey: 'KorisnikId' });
Nekretnina.belongsTo(Organizacija, { foreignKey: 'OrganizacijaId' });
Nekretnina.belongsTo(Korisnik, { as: 'DodijeljeniAgent', foreignKey: 'DodijeljeniAgentId' });

Razgovor.belongsTo(Nekretnina, { foreignKey: 'NekretninaId' });
Razgovor.belongsTo(Korisnik, { as: 'Pokretac', foreignKey: 'PokretacId' });
Razgovor.belongsTo(Korisnik, { as: 'Vlasnik', foreignKey: 'VlasnikId' });
Razgovor.belongsTo(Organizacija, { foreignKey: 'OrganizacijaId' });
Razgovor.hasMany(Poruka, { as: 'Poruke', foreignKey: 'RazgovorId', onDelete: 'CASCADE' });
Poruka.belongsTo(Razgovor, { foreignKey: 'RazgovorId' });
Poruka.belongsTo(Korisnik, { as: 'Posiljalac', foreignKey: 'PosiljalacId' });
TerminPregleda.belongsTo(Nekretnina, { foreignKey: 'NekretninaId' });
TerminPregleda.belongsTo(Razgovor, { foreignKey: 'RazgovorId' });
TerminPregleda.belongsTo(Korisnik, { as: 'Podnosilac', foreignKey: 'PodnosilacId' });
TerminPregleda.belongsTo(Korisnik, { as: 'Vlasnik', foreignKey: 'VlasnikId' });
PregovarackaPonuda.belongsTo(Nekretnina, { foreignKey: 'NekretninaId' });
PregovarackaPonuda.belongsTo(Razgovor, { foreignKey: 'RazgovorId' });
PregovarackaPonuda.belongsTo(Korisnik, { as: 'Ponudjac', foreignKey: 'PonudjacId' });
PregovarackaPonuda.belongsTo(Korisnik, { as: 'Primaoc', foreignKey: 'PrimaocId' });
PregovarackaPonuda.belongsTo(PregovarackaPonuda, { as: 'Roditelj', foreignKey: 'RoditeljPonudaId' });
JavniFaq.belongsTo(Nekretnina, { foreignKey: 'NekretninaId' });
JavniFaq.belongsTo(Korisnik, { as: 'Objavio', foreignKey: 'ObjavioId' });
Obavijest.belongsTo(Korisnik, { foreignKey: 'KorisnikId' });
ActivityEvent.belongsTo(Korisnik, { as: 'Actor', foreignKey: 'ActorId' });
AdminAuditLog.belongsTo(Korisnik, { as: 'Admin', foreignKey: 'AdminId' });
PrijavaSadrzaja.belongsTo(Korisnik, { as: 'Prijavio', foreignKey: 'PrijavioId' });
OglasRevizija.belongsTo(Nekretnina, { foreignKey: 'NekretninaId' });
OglasRevizija.belongsTo(Korisnik, { as: 'Autor', foreignKey: 'AutorId' });
OglasRevizija.belongsTo(Korisnik, { as: 'Pregledao', foreignKey: 'PregledaoId' });

Nekretnina.prototype.getInteresovanja = async function () {
  const [upiti, zahtjevi, ponude] = await Promise.all([
    this.getUpiti(),
    this.getZahtjevi(),
    this.getPonude(),
  ]);
  return [...upiti, ...zahtjevi, ...ponude];
};

module.exports = {
  sequelize, Korisnik, Nekretnina, Upit, Zahtjev, Ponuda, Komentar,
  SlikaNekretnine, OmiljenaNekretnina, SacuvanaPretraga,
  Organizacija, ClanstvoOrganizacije, Razgovor, Poruka, TerminPregleda,
  PregovarackaPonuda, JavniFaq, Obavijest, ActivityEvent, AdminAuditLog,
  PrijavaSadrzaja, OglasRevizija,
};
