const bcrypt = require('bcryptjs-then')
const crypto = require('crypto')
const { signToken } = require("../auth/token")
const { registrationEmail } = require("./registrationEmail")

const verifyUser = async (user, client) => {
    const expr = {
        USER: /[a-zA-Z0-9._]{3,}/,
        PASS: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[ -~]{8,}$/,
        MAIL: /^\S+@\S+\.\S+$/,
        NAME: /[a-zA-Z0-9 .]/,
    }

    if (!(user.username &&
        expr["USER"].test(user.username))) {
        return {
            statusCode: 400,
            body: {
                auth: false,
                error: "The username is invalid (It needs to be at least 3 characters long and contain only letters, numbers, dots and underscores)"
            }
        }
    }
    if (!(user.pass &&
        expr["PASS"].test(user.pass))) {
        return {
            statusCode: 400,
            body: {
                auth: false,
                error: "The password is invalid (It needs to be at least 8 characters long and contain at least one lowercase letter, one uppercase letter and one number)"
            }
        }
    }
    if (!(user.email &&
        expr["MAIL"].test(user.email))) {
        return {
            statusCode: 400,
            body: {
                auth: false,
                error: "The email is invalid (Please check if your spelling is correct and it follows the pattern something@something.something. If you believe this is an error, please contact us)"
            }
        }
    } else {
        const query = await client.query(`SELECT * FROM signup WHERE "mail" = $1`, [user.email])
        if (query.rowCount !== 1) {
            return {
                statusCode: 400,
                body: {
                    auth: false,
                    code: "ES",
                    error: "The email is not on the signup list. Please signup for the beta to access the app."
                }
            }
        }
    }

    const query = await client.query(`SELECT "username", "email" FROM users WHERE "email" = $1 OR "username" = $2`, [user.email, user.username])
    if (query.rowCount !== 0) {
        const {rows} = query
        let errorCode
        if (rows.length === 1) {
            if (rows[0].username === user.username.toLowerCase()) {
                if (rows[0].email === user.email) {
                    errorCode = "UE"
                } else {
                    errorCode = "U"
                }
            } else {
                errorCode = "E"
            }
        } else {
            errorCode = "UE"
        }

        return {
            statusCode: 400,
            body: {
                auth: false,
                code: errorCode,
                error: `The ${errorCode === "UE" ? "username and email" : (errorCode === "U" ? "username" : "email")} already exists.`
            }
        }
    }

    return {
        statusCode: 200
    }
}

const verifyCode = async (code, client) => {
    const query = await client.query(`DELETE FROM registrationcodes WHERE "code" = $1`, [code])

    if (query.rowCount !== 1) {
        return {
            statusCode: 400,
            body: {
                auth: false,
                code: "C",
                error: "This code is invalid."
            }
        }
    }
    return {
        statusCode: 200
    }
}

const register = async (body, client) => {
    try {
        const verified = await verifyUser(body, client)
        if (verified.statusCode === 400) {
            return verified
        }

        const vcode = await verifyCode(body.code, client)
        if (vcode.statusCode === 400) {
            return vcode
        }

        const saltRounds = 10
        const hash = await bcrypt.hash(body.pass, saltRounds)

        const tokens = 3
        const status = 0

        const tempHash = await crypto.randomBytes(64).toString('hex')

        await client.query(`INSERT INTO users("username", "email", "name", "pass", "tokens", "status", "tempHash") VALUES($1, $2, $3, $4, $5, $6, $7)`, [body.username.toLowerCase(), body.email.toLowerCase(), body.name, hash, tokens, status, tempHash])

        client.release()

        const send = await registrationEmail(body.email.toLowerCase(), tempHash)
        if (send !== true) {
            return {
                statusCode: send.status || 500,
                body: {
                    auth: false,
                    error: send.message
                }
            }
        }

        return {
            statusCode: 200,
            body: {
                auth: true,
                token: signToken(body.username.toLowerCase(), body.name, 0) //Not null because of query
            }
        }
    } catch (e) {
        return {
            statusCode: e.status || 500,
            body: {
                auth: false,
                error: e.message
            }
        }
    }
}

module.exports = { register }