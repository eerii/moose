const jwt = require('jsonwebtoken')

const signToken = (username) => {
    return jwt.sign(
        { username },
        process.env.SECRET, {
            expiresIn: 86400 //24h
        }
    )
}

const generatePolicy = async (principalId, effect, resource) => {
    let authResponse = {}

    authResponse.principalId = principalId

    if (effect && resource)
    {
        let policyDocument = {}
        policyDocument.Version = '2012-10-17'
        policyDocument.Statement = []

        let statementOne = {}
        statementOne.Action = 'execute-api:Invoke'
        statementOne.Effect = effect
        statementOne.Resource = resource

        policyDocument.Statement[0] = statementOne

        authResponse.policyDocument = policyDocument
    }

    return authResponse
}

const auth = async (event, context) => {

    const header = event.authorizationToken.split(" ")
    if (header.length !== 2)
        return {
            statusCode: 400,
            body: {
                auth: false,
                error: "The authorization header is not valid. Make sure you are using a header."
            }
        }

    const scheme = header[0]
    const token = header[1]
    if (!scheme || scheme !== "Bearer")
        return {
            statusCode: 401,
            body: {
                auth: false,
                error: "Unauthorized: There is no valid scheme. Make sure you are using Bearer."
            }
        }
    if (!token)
        return {
            statusCode: 401,
            body: {
                auth: false,
                error: "Unauthorized: There is no token."
            }
        }

    try {
        const decoded = await jwt.verify(token, process.env.SECRET)

        const policy = await generatePolicy(decoded.username, 'Allow', event.methodArn)

        return {
            statusCode: 200,
            ...policy
        }
    } catch (e) {
        return {
            statusCode: 401,
            body: {
                auth: false,
                error: "Unauthorized: " + e.message
            }
        }
    }
}

module.exports = { signToken, auth }