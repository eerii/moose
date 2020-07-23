const nodemailer = require('nodemailer')

const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, MAIL_SERVICE } = process.env

const transporter = nodemailer.createTransport({
    service: MAIL_SERVICE,
    host: MAIL_HOST,
    port: MAIL_PORT,
    auth: {
        user: MAIL_USER,
        pass: MAIL_PASS,
    },
})


module.exports.verifyMail = () => {
    transporter.verify(function(error, success) {
        if (error) {
            console.log(error);
        } else {
            console.log("Mail server is ready");
        }
    })
}


module.exports.sendMail = async event => {
    const html = `
	<h1>Test</h1>
	<p>This is a test</p>
	`

    const mailOptions = {
        from: '"MOOSE" <moosehour@gmail.com>',
        to: "test@mail.com",
        subject: "Test",
        html
    }

    try {
        let info = await transporter.sendMail(mailOptions)

        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify(
                {
                    success: true,
                    message: "Thank you!"
                },
                null,
                2,
            ),
        }
    }
    catch {
        return {
            statusCode: 500,
            headers: headers,
            body: JSON.stringify(
                {
                    success: false,
                    message: "Something went wrong. Try again later"
                },
                null,
                2,
            ),
        }
    }
}