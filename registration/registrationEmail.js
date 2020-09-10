const mailgun = require('mailgun-js')
const mail = mailgun({apiKey: process.env.MAIL, domain: 'moose.exchange'})

const registrationEmail = async (address, tempHash) => {
    try {
        const url = `https://moose.exchange/verify/${tempHash}`

        const msg = {
            from: 'MOOSE <hello@moose.exchange>',
            to: address,
            subject: 'Please verify your MOOSE email address',
            text: 'Thank you for signing up!',
            html: ` <div>
                        <h2 style="color: #4960F9">MOOSE</h2>
                        <h3>You have successfully registered an account with MOOSE!</h3>
                        <p>Just one more step, please verify your email using the button or the link bellow:</p>
                        
                        <div>
                          <!--[if mso]>
                            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:40px;v-text-anchor:middle;width:100px;" arcsize="10%" stroke="f" fillcolor="#4960F9">
                              <w:anchorlock/>
                              <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold;">
                                Button Text Here!
                              </center>
                            </v:roundrect>
                          <![endif]-->
                          <![if !mso]>
                          <table cellspacing="0" cellpadding="0"> <tr>
                          <td align="center" width="100" height="40" bgcolor="#4960F9" style="-webkit-border-radius: 5px; -moz-border-radius: 5px; border-radius: 5px; color: #ffffff; display: block;">
                            <a href="${url}" style="font-size:16px; font-weight: bold; font-family:sans-serif; text-decoration: none; line-height:40px; width:100%; display:inline-block">
                            <span style="color: #ffffff;">
                              Verify
                            </span>
                            </a>
                          </td>
                          </tr> </table>
                          <![endif]>
                        </div>
                        
                        <a href="${url}">${url}</a>
                        
                        <p>If you didn't sign up for MOOSE, please contact us as soon as possible at <a href="mailto:hello@moose.exchange">hello@moosehour.com</a>.</p>
                    </div>`
        }

        await mail.messages().send(msg)

        return true
    } catch (e) {
        return e
    }
}

module.exports = { registrationEmail }