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
            headers: { 'Content-Type': 'text/plain', ...headers },
            body: e.message
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