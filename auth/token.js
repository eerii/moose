const jwt = require('jsonwebtoken')

const signToken = (username) => {
    return jwt.sign(
        { username },
        process.env.SECRET, {
            expiresIn: 86400 //24h
        }
    )
}

const generatePolicy = (principalId, effect, resource) => {
    const authResponse = {}

    authResponse.principalId = principalId

    if (effect && resource)
    {
        const policyDocument = {}
        policyDocument.Version = '2012-10-17'
        policyDocument.Statement = []

        const statementOne = {}
        statementOne.Action = 'execute-api:Invoke'
        statementOne.Effect = effect
        statementOne.Resource = resource

        policyDocument.Statement[0] = statementOne

        authResponse.policyDocument = policyDocument
    }

    return authResponse
}

const auth = (event, context, callback) => {

    //Check header, url or post for Token
    const token = event.authorizationToken

    if (!token)
        return callback(null, 'Unauthorized')

    //Verify Secret
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err)
            return callback(null, 'Unauthorized')

        //If good, save request
        return callback(null, generatePolicy(decoded.id, 'Allow', event.methodArn))
    })
}

module.exports = { signToken, auth }