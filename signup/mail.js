const mailgun = require('mailgun-js')
const mail = mailgun({apiKey: process.env.MAIL, domain: 'moose.exchange'})

const msg = {
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

module.exports = { mail, msg }