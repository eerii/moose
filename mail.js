const mailgun = require('mailgun-js')
const mail = mailgun({apiKey: process.env.MAIL, domain: 'moose.exchange'});

module.exports.sendMail = async event => {
    const req = JSON.parse(event.body)

    const msg = {
        to: req.mail,
        from: 'MOOSE <hello@moose.exchange>',
        subject: 'Welcome to MOOSE!',
        text: 'Thank you for signing up!',
        html: '<div> ' +
                '<h2 style="color: #4960F9">MOOSE</h2>' +
                '<h3>Thank you for signing up!</h3>' +
                '<p>Our beta program is launching soon, and you will be the first one to know.</p>' +
                '<p>Discover more about MOOSE at our <a href="https://moosehour.com">website</a></p>' +
              '</div>',
    }

    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
    }

    try {
        let info = await mail.messages().send(msg)

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