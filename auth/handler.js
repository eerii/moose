const { connect } = require('../database/db')
const { register } = require('./register')
const { login } = require('./login')

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
}

module.exports.register = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    try {
        const client = await connect()

        const session = await register(JSON.parse(event.body), client)

        return {
            statusCode: session.statusCode || 200,
            headers,
            body: JSON.stringify(session.body)
        }
    } catch (e) {
        return {
            status: e.statusCode || 500,
            headers,
            body: JSON.stringify(e.body)
        }
    }
}

module.exports.login = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    try {
        const client = await connect()

        const session = await login(JSON.parse(event.body), client)

        return {
            statusCode: session.statusCode || 200,
            headers,
            body: JSON.stringify(session.body)
        }
    } catch (e) {
        return {
            status: e.statusCode || 500,
            headers: { 'Content-Type': 'text/plain', ...headers },
            body: e.message
        }
    }
}

module.exports.me = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    try {
        const client = await connect()

        const session = await me(event.requestContext.authorizer.principalId, client)

        return {
            statusCode: session.statusCode || 200,
            headers,
            body: JSON.stringify(session)
        }
    } catch (e) {
        return {
            status: e.statusCode || 500,
            headers: { 'Content-Type': 'text/plain', ...headers },
            body: e.message
        }
    }
}

const me = async (userID, client) => {
    try {
        const exists = await client.query(`SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)`, [userID])
        client.release()

        if (exists) {
            return {
                exists: true,
                username: userID
            }
        } else {
            return {
                statusCode: 400,
                exists: false,
                error: "No user found."
            }
        }
    } catch (e) {
        return {
            statusCode: 500,
            exists: false,
            error: e.message
        }
    }
}