const { Pool, Client } = require('pg');

const pool = new Pool({
    database: process.env.DB_NAME,
    host: process.env.DB,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
})

module.exports.add = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
    }

    try {
        await pool.connect()
        console.log("Connected Successfully")

        try {
            mail = JSON.parse(event.body).mail

            const client = await pool.connect()
            await client.query('INSERT INTO betausers(mail) VALUES($1) ON CONFLICT DO NOTHING', [mail])
            await client.release()

            return {
                statusCode: 200,
                headers,
                body: "User added!"
            }
        } catch (e) {
            console.log("Failed to Add User " + e)
            return {
                statusCode: e.statusCode || 500,
                headers,
                body: "Could not add user " + e
            }
        }
    } catch (e) {
        console.log("Failed to Connect Successfully " + e)
        return {
            statusCode: e.statusCode || 500,
            headers,
            body: "Could not add user " + e
        }
    }
}