const verifyUser = async (body, user, client) => {
    try {
        const query = await client.query(`SELECT "tempHash", "status" FROM users WHERE "username" = $1`, [user])

        if (!query.rows || query.rows.length !== 1) {
            return {
                statusCode: 500,
                verify: false
            }
        }

        const { tempHash: hash, status } = query.rows[0]
        if (status !== 0) {
            console.log("This user is already verified")
            return {
                statusCode: 500,
                verify: false
            }
        }
        if (hash === null)
            return {
                statusCode: 500,
                verify: false
            }
        if (hash !== body.hash) {
            console.log("The verification hash doesn't match the user")
            return {
                statusCode: 401,
                verify: false
            }
        }

        await client.query(`UPDATE users SET "status"=$2, "tempHash"=$3 WHERE "username" = $1`, [user, 1, null])

        client.release()

        return {
            statusCode: 200,
            verify: true
        }
    } catch (e) {
        return {
            statusCode: e.status || 500,
            verify: false
        }
    }
}

module.exports = {verifyUser}