const sgMail =  require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (options)=>{

    // const transporter = nodeMailer.createTransport({
    //     host: process.env.SMPT_HOST,
    //     port: process.env.SMPT_PORT,
    //     service: process.env.SMPT_SERVICE, /* The service provides a range of features, such as email templating, recipient management, and reporting, that make it easy for developers to send emails and track their delivery and engagement. */
    //     auth: {
    //         user: process.env.SMPT_MAIL,
    //         pass: process.env.SMPT_PASSWORD,
    //     },
    // });

    // const mailOptions = {
    //     from: process.env.SMPT_MAIL,
    //     to: options.email,
    //     subject: options.subject,
    //     html: options.message,
    //};

    //await transporter.sendMail(mailOptions);

    const mssg = {
        to: options.email,
        from: process.env.SENDGRID_MAIL,
        tempelateId: options.tempelateId,
        dynamic_tempelate_data: options.data,
    }
    sgMail.send(mssg).then(()=>{
        console.log('Email Sent');
    }).catch((error)=>{
        console.log(error);
    });
};
module.exports = sendEmail;
