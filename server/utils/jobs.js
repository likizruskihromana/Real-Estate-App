const { Op, QueryTypes }=require('sequelize');
const { sequelize, ActivityEvent, Pregovor, TerminPregleda, Obavijest }=require('../models');
const hub=require('./notificationHub');const {logger}=require('./observability');

async function runMaintenanceJobs(){
 await ActivityEvent.destroy({where:{createdAt:{[Op.lt]:new Date(Date.now()-365*86400000)}}});
 await Pregovor.update({status:'EXPIRED'},{where:{status:'OPEN',isticeAt:{[Op.lt]:new Date()}}});
 const terms=await TerminPregleda.findAll({where:{status:'CONFIRMED',predlozeniTermin:{[Op.between]:[new Date(),new Date(Date.now()+25*3600000)]}}});
 for(const term of terms){
  const hours=(new Date(term.predlozeniTermin).getTime()-Date.now())/3600000,kind=hours<=3?'T2H':'T24H';if(kind==='T24H'&&hours<20)continue;
  const [,created]=await sequelize.query('INSERT IGNORE INTO isporuceni_podsjetnik (vrsta, TerminPregledaId, createdAt) VALUES (:kind,:id,NOW())',{replacements:{kind,id:term.id},type:QueryTypes.INSERT});
  if(!created)continue;
  for(const userId of [term.PodnosilacId,term.VlasnikId]){const notification=await Obavijest.create({KorisnikId:userId,tip:'APPOINTMENT_REMINDER',naslov:'Podsjetnik za pregled',poruka:`Termin pregleda je ${new Date(term.predlozeniTermin).toLocaleString('bs-BA')}.`,link:'/termini'});hub.emit(`user:${userId}`,notification.toJSON())}
 }
}
function startJobs(){const run=()=>runMaintenanceJobs().catch(err=>logger.error({err},'maintenance_job_failed'));run();const timer=setInterval(run,5*60*1000);timer.unref();return()=>clearInterval(timer)}
module.exports={runMaintenanceJobs,startJobs};
