const { connect } = require('../database/db')

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
}

module.exports.connect = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    const connectionID = event.requestContext.connectionId

    try {
        const client = await connect()
        await client.query(`INSERT INTO connections VALUES($1)`, [connectionID])
        client.release()
    } catch (e) {
        console.log(e)
        return { statusCode: 500, body: 'Failed to connect: ' + JSON.stringify(e) }
    }

    console.log("Successfully connected to WebSocket")
    return { statusCode: 200, body: 'Connected.' }
}