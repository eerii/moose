const { connect } = require('../database/db')

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
}

module.exports.disconnect = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    const connectionID = event.requestContext.connectionId

    try {
        const client = await connect()

        await client.query(`DELETE FROM connections WHERE connectionID = $1`, [connectionID])

        client.release()

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'text/plain', ...headers },
            body: "Disconnected."
        }
    } catch (e) {
        return {
            status: e.statusCode || 500,
            headers: { 'Content-Type': 'text/plain', ...headers },
            body: "Failed to disconnect: " + e.message
        }
    }
}