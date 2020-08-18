const bcrypt = require('bcryptjs-then')
const { signToken, signMiniToken } = require("./token")

const comparePass = async (bodyPass, userPass, userID, mini, name, status) => {
    const valid = await bcrypt.compare(bodyPass, userPass)
    return valid ? (mini ? signMiniToken(userID) : signToken(userID, name, status)) : "Unauthorized"
}

const login = async (body, client) => {
    try {
        const { rows } = body.username.includes("@") ?
            await client.query(`SELECT "username", "name", "pass", "status" FROM users WHERE email = $1`, [body.username.toLowerCase()]) : //Email
            await client.query(`SELECT "username", "name", "pass", "status" FROM users WHERE username = $1`, [body.username.toLowerCase()]) //Username

        client.release()

        if (rows.length !== 1) {
            return {
                statusCode: 400,
                body: {
                    auth: false,
                    error: "That user is not registered. Please check the spelling and try again."
                }}}

        const user = rows[0]

        const token = await comparePass(body.pass, user.pass, user.username, body.mini || false, user.name, user.status)

        if (token === "Unauthorized") {
            return {
                statusCode: 401,
                body: {
                    auth: false,
                    error: "Unauthorized: The credentials are incorrect."
                }
            }
        }

        return {
            statusCode: 200,
            body: {
                auth: true,
                token
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

module.exports = { login }