const { signToken } = require("../auth/token")

const verifyUser = async (body, user, name, client) => {
    try {
        const query = await client.query(`SELECT "tempHash", "status" FROM users WHERE "username" = $1`, [user])

        if (!query.rows || query.rows.length !== 1) {
            return {
                statusCode: 500,
                body: {
                    verify: false,
                    error: "The user does not exist"
                }
            }
        }

        const { tempHash: hash, status } = query.rows[0]
        if (status !== 0) {
            return {
                statusCode: 400,
                body: {
                    verify: false,
                    error: "This user is already verified"
                }
            }
        }
        if (hash === null)
            return {
                statusCode: 400,
                body: {
                    verify: false,
                    error: "This user is already verified"
                }
            }
        if (hash !== body.hash) {
            return {
                statusCode: 401,
                body: {
                    verify: false,
                    error: "The verification hash doesn't match the user"
                }
            }
        }

        const statusCode = 1

        await client.query(`UPDATE users SET "status"=$2, "tempHash"=$3 WHERE "username" = $1`, [user, statusCode, null])

        client.release()

        const token = signToken(user, name, statusCode)

        return {
            statusCode: 200,
            body: {
                verify: true,
                token
            }
        }
    } catch (e) {
        return {
            statusCode: e.status || 500,
            body: {
                verify: false,
                error: e.message()
            }
        }
    }
}

module.exports = {verifyUser}