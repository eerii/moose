const bcrypt = require('bcryptjs-then')
const { signMiniToken } = require("./token")

const validate = async (body, client) => {
    try {
        const query = await client.query(`DELETE FROM registrationcodes WHERE "code" = $1`, [body.code])

        if (query.rowCount !== 1) {
            return {
                statusCode: 400,
                body: {
                    auth: false,
                    error: "This code is invalid."
                }}}

        client.release()

        const token = await signMiniToken(body.username)

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

module.exports = { validate }