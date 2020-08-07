const AWS = require('aws-sdk')
const { connect } = require('../database/db')

module.exports.sendMessage = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    let body = JSON.parse(event.body)

    let connectionData
    try {
        const client = await connect()

        if (body.type === "close") {
            await client.query(`DELETE FROM connections WHERE "connectionID" = $1`, [body.sender])
        }


        if (body.type === "start-time") {
            const localTime = await Math.round(Date.now() / 1000)

            await client.query(`INSERT INTO timetracking("userA", "userB", "start", "previous", "token") VALUES ($1, $2, $3, $4, $5)`, [body.sender, body.data, localTime, localTime, 0])

            //The first time token is used after 10 minutes, if you want to change this, add here an update of the users and set initial value to 1

            body.data = "OK: STARTED TIME TRACKING"
        }

        if (body.type === "add-time") {
            const res = await client.query(`SELECT "previous", "token" FROM timetracking WHERE previous = (SELECT MAX(previous) FROM timetracking WHERE "userA" = $1)`, [body.sender])
            const { previous, token } = res.rows[0]

            const localTime = await Math.round(Date.now() / 1000)

            const difference = (localTime - 600) - previous //10 Minutes

            if (Math.abs(difference) < 60) { //1 Minute margin
                await client.query(`UPDATE timetracking SET "previous" = $1, "token" = $2 WHERE previous = (SELECT MAX(previous) FROM timetracking WHERE "userA" = $3)`, [localTime, token + 1, body.sender])

                await client.query(`UPDATE users SET "tokens" = "tokens" + 1 WHERE "username" = $1`, [body.sender])
                await client.query(`UPDATE users SET "tokens" = "tokens" - 1 WHERE "username" = $1`, [body.data])

                body.data = `OK: ADDED TIME WITH DIFERENCE ${difference}s AND USED ${token + 1} TIME TOKENS`
            } else {
                body.data = "ERROR: DIFFERENCE IN TIMES " + difference + "s" + ` LocalTime ${localTime} PreviousTime ${previous}`
            }
        }

        connectionData = (body.type === "getID") ?
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
        type: ((body.type === "getID") ? "id" : body.type) || "default",
        sender: body.sender,
        target: body.target,
        date: body.date,
        userlist: (body.type === "getID") ? connectionData.rows : null
    }

    const calls = connectionData.rows.map(async ({ connectionID }) => {
        try {
            if (body.target) {
                if (body.target === connectionID) {
                    console.log("Trying targeted " + connectionID)
                    await apiGateway.postToConnection({ ConnectionId: connectionID, Data: JSON.stringify(res) }).promise()
                }
            } else {
                console.log("Trying " + connectionID)
                await apiGateway.postToConnection({ ConnectionId: connectionID, Data: JSON.stringify(res) }).promise()
            }
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