module.exports.generatePolicy = async (principalId, effect, resource, name) => {
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

        if (name) {
            authResponse.context = { "name": name }
        } else {
            authResponse.context = { "name": "no name" }
        }
    }

    return authResponse
}