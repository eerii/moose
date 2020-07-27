const bcrypt = require('bcryptjs-then')
const { signToken } = require("./token")

const verifyUser = (user) => {
    const expr = {
        USER: /[a-zA-Z0-9]{3,}/,
        PASS: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,}$/,
        MAIL: /^\S+@\S+\.\S+$/,
        NAME: /[a-zA-Z0-9 .]/,
    }

    if (!(user.username &&
        expr["USER"].test(user.username))) {
        return {
            statusCode: 400,
            body: {
                auth: false,
                error: "The username is invalid (It needs to be at least 3 characters long and contain only letters and numbers)"
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
    }
    return {
        statusCode: 200
    }
}

const register = async (body, client) => {
    try {
        const verified = verifyUser(body)
        if (verified.statusCode === 400) {
            return verified
        }

        const saltRounds = 10
        const hash = await bcrypt.hash(body.pass, saltRounds)

        await client.query(`INSERT INTO users VALUES($1, $2, $3, $4)`, [body.username, body.email, body.name, hash])

        client.release()

        return {
            statusCode: 200,
            body: {
                auth: true,
                token: signToken(body.username) //Not null because of query
            }
        }
    } catch (e) {
        return {
            statusCode: e.statusCode || 500,
            body: {
                auth: false,
                error: e.message
            }
        }
    }
}

module.exports = { register }