const mail = require('@sendgrid/mail')

module.exports.sendMail = async event => {
    const req = JSON.parse(event.body)

    const {MAIL} = process.env
    await mail.setApiKey(MAIL)

    const msg = {
        to: req.mail,
        from: 'hello@moose.exchange',
        subject: 'Welcome to MOOSE!',
        text: 'Thank you for signing up!',
        html: '<h1>MOOSE<h1/><h2>Thank you for signing up<h2/>',
    }

    const headers = {
        "Access-Control-Allow-Origin": "*",
        'Access-Control-Allow-Headers': "Access-Control-Allow-Origin",
    }

    try {
        let info = await mail.send(msg)

        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify(info, null, 2),
        }
    }
    catch (error) {
        return {
            statusCode: 500,
            headers: headers,
            body: JSON.stringify(
                {
                    success: false,
                    message: error.message//"Something went wrong. Try again later"
                },
                null,
                2,
            ),
        }
    }
}