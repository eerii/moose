const { connect } = require('../database/db')
const { search } = require('./search')
const { discover } = require('./discover')

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
}

module.exports.search = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    try {
        const client = await connect()

        const session = await search(JSON.parse(event.body), client)

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

module.exports.discover = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    try {
        const client = await connect()

        const username = event.requestContext.authorizer.principalId

        const session = await discover(JSON.parse(event.body), username, client)

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