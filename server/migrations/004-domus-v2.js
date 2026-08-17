const { DataTypes } = require('sequelize');

async function addColumns(queryInterface, table, columns, transaction) {
  const current = await queryInterface.describeTable(table);
  for (const [name, definition] of Object.entries(columns)) {
    if (!current[name]) await queryInterface.addColumn(table, name, definition, { transaction });
  }
}

const timestamps = () => ({
  createdAt: { type: DataTypes.DATE, allowNull: false },
  updatedAt: { type: DataTypes.DATE, allowNull: false },
});
const ref = (model, allowNull = false, onDelete = 'CASCADE') => ({ type: DataTypes.INTEGER, allowNull, references: { model, key: 'id' }, onDelete });

async function up({ queryInterface, transaction }) {
  await addColumns(queryInterface, 'korisnik', {
    email: { type: DataTypes.STRING(255), allowNull: true, unique: true },
    emailVerifiedAt: { type: DataTypes.DATE, allowNull: true },
    emailVerificationTokenHash: DataTypes.STRING(64),
    emailVerificationExpiresAt: DataTypes.DATE,
    passwordResetTokenHash: DataTypes.STRING(64),
    passwordResetExpiresAt: DataTypes.DATE,
    systemRole: { type: DataTypes.ENUM('USER', 'ANALYST', 'MODERATOR', 'SUPER_ADMIN'), allowNull: false, defaultValue: 'USER' },
    suspendedAt: DataTypes.DATE,
    suspendedUntil: DataTypes.DATE,
    suspensionReason: DataTypes.STRING(500),
    deletedAt: DataTypes.DATE,
  }, transaction);
  await queryInterface.bulkUpdate('korisnik', { systemRole: 'SUPER_ADMIN' }, { admin: true }, { transaction });

  const tables = new Set((await queryInterface.showAllTables()).map(String).map(x => x.toLowerCase()));
  if (!tables.has('organizacija')) await queryInterface.createTable('organizacija', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true }, naziv: { type: DataTypes.STRING(160), allowNull: false }, slug: { type: DataTypes.STRING(180), allowNull: false, unique: true }, opis: DataTypes.TEXT, grad: DataTypes.STRING(100), telefon: DataTypes.STRING(40), web: DataTypes.STRING(255), registracijskiBroj: DataTypes.STRING(100), status: { type: DataTypes.ENUM('PENDING','VERIFIED','REJECTED','SUSPENDED'), defaultValue:'PENDING' }, razlogOdluke: DataTypes.TEXT, verificiranaAt: DataTypes.DATE, KreatorId: ref('korisnik', false, 'RESTRICT'), ...timestamps(),
  }, { transaction });
  if (!tables.has('clanstvo_organizacije')) await queryInterface.createTable('clanstvo_organizacije', {
    id:{type:DataTypes.INTEGER,autoIncrement:true,primaryKey:true}, uloga:{type:DataTypes.ENUM('OWNER','MANAGER','AGENT'),defaultValue:'AGENT'}, status:{type:DataTypes.ENUM('INVITED','ACTIVE','REVOKED'),defaultValue:'ACTIVE'}, OrganizacijaId:ref('organizacija'), KorisnikId:ref('korisnik'), ...timestamps(),
  }, { transaction });
  if (!tables.has('clanstvo_organizacije')) await queryInterface.addIndex('clanstvo_organizacije',['OrganizacijaId','KorisnikId'],{unique:true,name:'clanstvo_org_korisnik_uq',transaction});

  await addColumns(queryInterface, 'nekretnina', {
    slug:{type:DataTypes.STRING(180),allowNull:true,unique:true}, namjena:{type:DataTypes.ENUM('PRODAJA','NAJAM'),defaultValue:'PRODAJA'}, status:{type:DataTypes.ENUM('DRAFT','PENDING_REVIEW','CHANGES_REQUESTED','PUBLISHED','REJECTED','ARCHIVED','SOLD','RENTED'),defaultValue:'PUBLISHED'}, grad:DataTypes.STRING(100), naselje:DataTypes.STRING(100), punaAdresa:DataTypes.STRING(255), latPriblizno:DataTypes.DECIMAL(10,7), lngPriblizno:DataTypes.DECIMAL(10,7), latTacno:DataTypes.DECIMAL(10,7), lngTacno:DataTypes.DECIMAL(10,7), brojSoba:DataTypes.INTEGER, brojKupatila:DataTypes.INTEGER, sprat:DataTypes.INTEGER, brojSpratova:DataTypes.INTEGER, parking:{type:DataTypes.BOOLEAN,defaultValue:false}, balkon:{type:DataTypes.BOOLEAN,defaultValue:false}, lift:{type:DataTypes.BOOLEAN,defaultValue:false}, namjestenost:DataTypes.STRING(50), stanje:DataTypes.STRING(80), energetskaKlasa:DataTypes.STRING(10), dostupnoOd:DataTypes.DATEONLY, pogodnosti:DataTypes.JSON, OrganizacijaId:ref('organizacija',true,'SET NULL'), DodijeljeniAgentId:ref('korisnik',true,'SET NULL'),
  }, transaction);

  if (!tables.has('razgovor')) await queryInterface.createTable('razgovor', { id:{type:DataTypes.INTEGER,autoIncrement:true,primaryKey:true}, status:{type:DataTypes.ENUM('OPEN','CLOSED','BLOCKED'),defaultValue:'OPEN'}, zadnjaPorukaAt:DataTypes.DATE, NekretninaId:ref('nekretnina'), PokretacId:ref('korisnik'), VlasnikId:ref('korisnik'), OrganizacijaId:ref('organizacija',true,'SET NULL'), ...timestamps() }, { transaction });
  if (!tables.has('razgovor')) await queryInterface.addIndex('razgovor',['NekretninaId','PokretacId'],{unique:true,name:'razgovor_nekretnina_pokretac_uq',transaction});
  if (!tables.has('poruka_v2')) await queryInterface.createTable('poruka_v2',{id:{type:DataTypes.INTEGER,autoIncrement:true,primaryKey:true},tekst:{type:DataTypes.TEXT,allowNull:false},procitanoAt:DataTypes.DATE,RazgovorId:ref('razgovor'),PosiljalacId:ref('korisnik'),...timestamps()},{transaction});
  if (!tables.has('termin_pregleda')) await queryInterface.createTable('termin_pregleda',{id:{type:DataTypes.INTEGER,autoIncrement:true,primaryKey:true},predlozeniTermin:{type:DataTypes.DATE,allowNull:false},alternativniTermini:DataTypes.JSON,status:{type:DataTypes.ENUM('PENDING','CONFIRMED','RESCHEDULED','DECLINED','CANCELLED','COMPLETED'),defaultValue:'PENDING'},odgovor:DataTypes.TEXT,NekretninaId:ref('nekretnina'),RazgovorId:ref('razgovor',true,'SET NULL'),PodnosilacId:ref('korisnik'),VlasnikId:ref('korisnik'),...timestamps()},{transaction});
  if (!tables.has('pregovaracka_ponuda')) await queryInterface.createTable('pregovaracka_ponuda',{id:{type:DataTypes.INTEGER,autoIncrement:true,primaryKey:true},iznos:{type:DataTypes.DECIMAL(12,2),allowNull:false},poruka:DataTypes.TEXT,status:{type:DataTypes.ENUM('SUBMITTED','COUNTERED','ACCEPTED','REJECTED','WITHDRAWN','EXPIRED'),defaultValue:'SUBMITTED'},NekretninaId:ref('nekretnina'),RazgovorId:ref('razgovor',true,'SET NULL'),PonudjacId:ref('korisnik'),PrimaocId:ref('korisnik'),RoditeljPonudaId:ref('pregovaracka_ponuda',true,'SET NULL'),...timestamps()},{transaction});
  if (!tables.has('javni_faq')) await queryInterface.createTable('javni_faq',{id:{type:DataTypes.INTEGER,autoIncrement:true,primaryKey:true},pitanje:{type:DataTypes.TEXT,allowNull:false},odgovor:{type:DataTypes.TEXT,allowNull:false},status:{type:DataTypes.ENUM('PUBLISHED','HIDDEN'),defaultValue:'PUBLISHED'},NekretninaId:ref('nekretnina'),ObjavioId:ref('korisnik'),...timestamps()},{transaction});
  if (!tables.has('obavijest')) await queryInterface.createTable('obavijest',{id:{type:DataTypes.INTEGER,autoIncrement:true,primaryKey:true},tip:{type:DataTypes.STRING(60),allowNull:false},naslov:{type:DataTypes.STRING(160),allowNull:false},poruka:{type:DataTypes.STRING(500),allowNull:false},link:DataTypes.STRING(255),procitanoAt:DataTypes.DATE,KorisnikId:ref('korisnik'),...timestamps()},{transaction});
  if (!tables.has('activity_event')) await queryInterface.createTable('activity_event',{id:{type:DataTypes.BIGINT,autoIncrement:true,primaryKey:true},tip:{type:DataTypes.STRING(80),allowNull:false},entitetTip:DataTypes.STRING(60),entitetId:DataTypes.INTEGER,metadata:DataTypes.JSON,ActorId:ref('korisnik',true,'SET NULL'),createdAt:{type:DataTypes.DATE,allowNull:false}},{transaction});
  if (!tables.has('admin_audit_log')) await queryInterface.createTable('admin_audit_log',{id:{type:DataTypes.BIGINT,autoIncrement:true,primaryKey:true},akcija:{type:DataTypes.STRING(80),allowNull:false},entitetTip:{type:DataTypes.STRING(60),allowNull:false},entitetId:DataTypes.INTEGER,razlog:{type:DataTypes.STRING(500),allowNull:false},metadata:DataTypes.JSON,AdminId:ref('korisnik',false,'RESTRICT'),createdAt:{type:DataTypes.DATE,allowNull:false}},{transaction});
  if (!tables.has('prijava_sadrzaja')) await queryInterface.createTable('prijava_sadrzaja',{id:{type:DataTypes.INTEGER,autoIncrement:true,primaryKey:true},tip:{type:DataTypes.ENUM('PORUKA','OGLAS','FAQ'),allowNull:false},entitetId:{type:DataTypes.INTEGER,allowNull:false},razlog:{type:DataTypes.STRING(500),allowNull:false},snapshot:DataTypes.JSON,status:{type:DataTypes.ENUM('OPEN','RESOLVED','DISMISSED'),defaultValue:'OPEN'},PrijavioId:ref('korisnik'),...timestamps()},{transaction});
  if (!tables.has('oglas_revizija')) await queryInterface.createTable('oglas_revizija',{id:{type:DataTypes.INTEGER,autoIncrement:true,primaryKey:true},podaci:{type:DataTypes.JSON,allowNull:false},status:{type:DataTypes.ENUM('PENDING_REVIEW','APPROVED','CHANGES_REQUESTED','REJECTED'),defaultValue:'PENDING_REVIEW'},razlogOdluke:DataTypes.TEXT,NekretninaId:ref('nekretnina'),AutorId:ref('korisnik'),PregledaoId:ref('korisnik',true,'SET NULL'),...timestamps()},{transaction});
}

async function down({ queryInterface, transaction }) {
  for (const table of ['oglas_revizija','prijava_sadrzaja','admin_audit_log','activity_event','obavijest','javni_faq','pregovaracka_ponuda','termin_pregleda','poruka_v2','razgovor','clanstvo_organizacije']) await queryInterface.dropTable(table,{transaction});
  const propertyColumns=['DodijeljeniAgentId','OrganizacijaId','pogodnosti','dostupnoOd','energetskaKlasa','stanje','namjestenost','lift','balkon','parking','brojSpratova','sprat','brojKupatila','brojSoba','lngTacno','latTacno','lngPriblizno','latPriblizno','punaAdresa','naselje','grad','status','namjena','slug'];
  for (const column of propertyColumns) await queryInterface.removeColumn('nekretnina',column,{transaction});
  await queryInterface.dropTable('organizacija',{transaction});
  for (const column of ['deletedAt','suspensionReason','suspendedUntil','suspendedAt','systemRole','passwordResetExpiresAt','passwordResetTokenHash','emailVerificationExpiresAt','emailVerificationTokenHash','emailVerifiedAt','email']) await queryInterface.removeColumn('korisnik',column,{transaction});
}
module.exports={name:'004-domus-v2',up,down};
