const crypto=require('crypto');const fs=require('fs');const path=require('path');const multer=require('multer');
const privateUploadsDir=path.join(__dirname,'../../uploads/private');fs.mkdirSync(privateUploadsDir,{recursive:true});
const allowed=new Map([['application/pdf','.pdf'],['image/jpeg','.jpg'],['image/png','.png']]);
const storage=multer.diskStorage({destination:privateUploadsDir,filename:(_req,file,cb)=>cb(null,`${crypto.randomUUID()}${allowed.get(file.mimetype)||''}`)});
const uploader=multer({storage,limits:{fileSize:10*1024*1024,files:1,parts:4},fileFilter:(_req,file,cb)=>allowed.has(file.mimetype)?cb(null,true):cb(Object.assign(new Error('Dozvoljeni su PDF, JPG i PNG dokumenti.'),{status:400}))});
function uploadPrivateDocument(req,res,next){uploader.single('dokument')(req,res,error=>error?next(Object.assign(error,{status:400})):next())}
module.exports={uploadPrivateDocument,privateUploadsDir};
