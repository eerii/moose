const jwt = require('jsonwebtoken')
const { generatePolicy } = require("./policy")

module.exports.auth = async (event, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2))

    const query = event.queryStringParameters

    if (query.Auth) {
        console.log("WARNING: Using Query Authentication")
        try {
            const decoded = await jwt.verify(query.Auth, process.env.SECRET)

            const policy = await generatePolicy(decoded.username, 'Allow', event.methodArn)

            return policy
        } catch (e) {
            return {
                statusCode: 401,
                body: {
                    auth: false,
                    error: "Unauthorized: " + e.message
                }
            }
        }
    } else {
        return {
            statusCode: 401,
            body: {
                auth: false,
                error: "Unauthorized: There is no authentication."
            }
        }
    }
}