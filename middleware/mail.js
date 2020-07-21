const nodemailer=require('nodemailer');

const mail= async (recieverMail,content)=>{
    var transport=nodemailer.createTransport(
        {
        service:process.env.MAIL_SERVER,
        auth:{
                user:process.env.MAIL_ID,
                pass:process.env.MAIL_PASS
             }
        }
    )
    var mailOptions={
        from:'juego1544@gmail.com',
        to:recieverMail,
        subject:'Hey there,forgot your password??',
        text:'Use this temporary password is '+content
    };
try{
    const result= await transport.sendMail(mailOptions);
    console.log('success');
}
catch(err){
    console.log(err);
}

}

module.exports=mail;

