const { connect } = require('../database/db')

module.exports.disconnect = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    const connectionID = event.requestContext.connectionId

    try {
        const client = await connect()
        await client.query(`DELETE FROM connections WHERE "connectionID" = $1`, [connectionID])
        client.release()
    } catch (e) {
        console.log(e)
        return {statusCode: 500, body: 'Failed to disconnect: ' + JSON.stringify(e)}
    }
    return { statusCode: 200, body: 'Disconnected.' }
}