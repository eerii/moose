const {connect} = require("../database/db")

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
}

module.exports.start = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    try {
        const client = await connect()

        try {
            const req = JSON.parse(event.body)

            const localTime = Math.round(Date.now() / 1000)

            await client.query(`INSERT INTO timetracking("userA", "userB", "start") VALUES ($1, $2, $3)`, [req.caller, req.receiver, localTime])
            await client.release()

            return {
                statusCode: 200,
                headers,
                body: "Started Time Tracking!"
            }
        } catch (e) {
            console.log("Failed to Start Time Tracking " + e.message)
            return {
                statusCode: e.statusCode || 500,
                headers,
                body: "Could not start time tracking " + e
            }
        }
    } catch (e) {
        console.log("Failed to Connect Successfully " + e.message)
        return {
            statusCode: e.statusCode || 500,
            headers,
            body: "Could not start time tracking " + e
        }
    }
}