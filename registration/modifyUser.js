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
        body.status !== undefined ? `"status"=$${addCount()},` : ""}`.slice(0, -1)

    const updateArr = [body.need, body.offer, body.birthdate, body.funfact, body.bio, body.country, body.status].filter((x) => x !== undefined)

    console.log(updateStr, updateArr)

    try {
        const query = await client.query(`UPDATE users SET ${updateStr} WHERE "username" = $1`, [user, ...updateArr])

        console.log(query.rowCount)

        client.release()

        return {
            statusCode: 200,
            body: {
                auth: true,
                token: signToken(user, name, 3, 1)
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