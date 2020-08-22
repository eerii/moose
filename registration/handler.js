const { connect } = require('../database/db')
const { register } = require('./register')
const { modifyUser } = require('./modifyUser')
const { verifyUser } = require('./verifyUser')

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

module.exports.modifyUser = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    try {
        const client = await connect()

        const username = event.requestContext.authorizer.principalId
        const name = event.requestContext.authorizer.name

        const session = await modifyUser(JSON.parse(event.body), username, name, client)

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

module.exports.verifyUser = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    try {
        const client = await connect()

        const username = event.requestContext.authorizer.principalId
        const name = event.requestContext.authorizer.name

        const session = await verifyUser(JSON.parse(event.body), username, name, client)

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