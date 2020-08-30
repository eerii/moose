const { connect } = require('../database/db')

module.exports.connect = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    const connectionID = event.requestContext.connectionId

    if (event.requestContext.authorizer) {
        const username = event.requestContext.authorizer.principalId
        const name = event.requestContext.authorizer.name
        const room = event.requestContext.authorizer.room
        const time = event.requestContext.connectedAt

        try {
            const client = await connect()

            const { rows } = await client.query(`SELECT master, users, oncall FROM rooms WHERE room=$1`, [room])

            if (rows.length !== 1)
                return { statusCode: 401, body: 'Unauthorized. Room does not exist'}

            if (!(rows[0].master === username || JSON.stringify(rows[0].users).includes(username)))
                return { statusCode: 401, body: 'Unauthorized. User not allowed in room.'}

            await client.query(`INSERT INTO connections VALUES($1, $2, $3, $4, $5)`, [connectionID, username, time, name, room])

            client.release()
        } catch (e) {
            console.log(e)
            return { statusCode: 500, body: 'Failed to connect: ' + JSON.stringify(e) }
        }

        console.log("Successfully connected to WebSocket")
        return { statusCode: 200, body: "Connected." }
    } else {
        return { statusCode: 401, body: 'Unauthorized.'}
    }
}