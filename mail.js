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
    const req = JSON.parse(event.body)

    const html = `
	<h1>Test</h1>
	<p>This is a test</p>
	`

    const mailOptions = {
        from: '"MOOSE" <moosehour@gmail.com>',
        to: req.mail,
        subject: "Test",
        html
    }

    const ownMailOptions = {
        from: '"MOOSE" <moosehour@gmail.com>',
        to: "moosehour@gmail.com",
        subject: "New registration",
        text: req.mail
    }

    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
    }

    try {
        let info = await transporter.sendMail(mailOptions)
        let info2 = await transporter.sendMail(ownMailOptions)

        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify(info, null, 2),
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