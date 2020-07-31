const AWS = require('aws-sdk')
const { connect } = require('../database/db')

module.exports.sendMessage = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    const body = JSON.parse(event.body)

    let connectionData
    try {
        const client = await connect()

        connectionData = (body.type === "id") ?
            await client.query(`SELECT * FROM connections`) :
            await client.query(`SELECT "connectionID" FROM connections`)

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

    const res = {
        message: body.data,
        type: body.type || "default",
        sender: body.sender,
        target: body.target,
        date: body.date,
        userlist: (body.type === "id") ? connectionData.rows : null
    }

    const calls = connectionData.rows.map(async ({ connectionID }) => {
        try {
            console.log("Trying " + connectionID)

            await apiGateway.postToConnection({ ConnectionId: connectionID, Data: JSON.stringify(res) }).promise()
        } catch (e) {
            if (e.statusCode === 410) {
                console.log(`Found stale connection, deleting ${connectionID}`)
                const client = await connect()
                await client.query(`DELETE FROM connections WHERE "connectionID" = $1`, [connectionID])
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

    console.log("Successfully sent message.")
    return { statusCode: 200, body: 'Data sent.' }
}