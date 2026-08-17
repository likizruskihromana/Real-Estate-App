const buckets = new Map();
function limit(name, max, windowMs) { return (req,res,next) => { const now=Date.now(),key=`${name}:${req.session?.userId||req.ip}`,current=buckets.get(key);if(!current||current.resetAt<=now){buckets.set(key,{count:1,resetAt:now+windowMs});return next()}if(current.count>=max){res.set('Retry-After',String(Math.ceil((current.resetAt-now)/1000)));return res.status(429).json({error:{code:'RATE_LIMITED',message:'Previše zahtjeva. Pokušajte ponovo kasnije.',requestId:req.requestId}})}current.count++;next() } }
module.exports = {
  messageRateLimit: limit('message', 30, 60_000),
  offerRateLimit: limit('offer', 10, 15*60_000),
  uploadRateLimit: limit('upload', 20, 15*60_000),
};
