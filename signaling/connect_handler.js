const { connect } = require('../database/db')

module.exports.connect = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    const connectionID = event.requestContext.connectionId

    if (event.requestContext.authorizer) {
        const username = event.requestContext.authorizer.principalId

        const name = event.requestContext.authorizer.name

        const time = event.requestContext.connectedAt

        try {
            const client = await connect()
            await client.query(`INSERT INTO connections VALUES($1, $2, $3, $4)`, [connectionID, username, time, name])
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