const { signToken } = require("../auth/token")

const modifyUser = async (body, user, name, client) => {
    let count = 1
    const addCount = () => {
        count += 1
        return count
    }

    const updateStr = `${
        body.need !== undefined ? `"need"=$${addCount()},` : ""}${
        body.offer !== undefined ? `"offer"=$${addCount()},` : ""}${
        body.birthdate !== undefined ? `"birthdate"=$${addCount()},` : ""}${
        body.funfact !== undefined ? `"funfact"=$${addCount()},` : ""}${
        body.bio !== undefined ? `"bio"=$${addCount()},` : ""}${
        body.country !== undefined ? `"country"=$${addCount()},` : ""}${
        body.language !== undefined ? `"language"=$${addCount()},` : ""}${
        body.otherlanguages !== undefined ? `"otherlanguages"=$${addCount()},` : ""}${
        body.status !== undefined ? `"status"=$${addCount()},` : ""}`.slice(0, -1)

    const updateArr = [body.need, body.offer, body.birthdate, body.funfact, body.bio, body.country, body.language, body.otherlanguages, body.status].filter((x) => x !== undefined)

    try {
        const query = await client.query(`UPDATE users SET ${updateStr} WHERE "username" = $1`, [user, ...updateArr])
        client.release()

        if (query.rowCount !== 1) {
            return {
                statusCode: 400,
                body: {
                    auth: false,
                    error: "The user does not exist"
                }
            }
        }

        if (body.status !== undefined) {
            const token = signToken(user, name, body.status)
            return {
                statusCode: 200,
                body: {
                    auth: true,
                    token
                }
            }
        }

        return {
            statusCode: 200,
            body: {
                auth: true,
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

module.exports = { modifyUser }