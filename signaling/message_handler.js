const AWS = require('aws-sdk')
const { connect } = require('../database/db')

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
}

module.exports.sendMessage = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    let connectionData
    try {
        const client = await connect()
        connectionData = await client.query(`SELECT "connectionID" FROM connections`)
        client.release()
        if (!connectionData) {
            return { statusCode: 400, body: "No connection data." }
        }
    } catch (e) {
        return { statusCode: 500, body: e.stack }
    }

    const apiGateway = new AWS.ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint: event.requestContext.domainName + '/' + event.requestContext.stage
    })

    const data = JSON.parse(event.body).data

    const calls = connectionData.rows.map(async ({ connectionID }) => {
        try {
            console.log("Trying " + connectionID)

            await apiGateway.postToConnection({ ConnectionId: connectionID, Data: data }).promise()
        } catch (e) {
            if (e.statusCode === 410) {
                console.log(`Found stale connection, deleting ${connectionID}`)
                const client = await connect()
                client.query(`DELETE FROM connections WHERE connectionID = $1`, [connectionID])
                client.release()
            } else {
                console.log(e)
                throw e;
            }
        }
    })

    try {
        await Promise.all(calls)
    } catch (e) {
        return { statusCode: 500, body: e.stack }
    }

    console.log("Successful")
    return { statusCode: 200, body: 'Data sent.' }
}