const { connect } = require('../database/db')
const { login } = require('./login')

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
}

module.exports.login = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
    const client = await connect()

    const session = await login(JSON.parse(event.body), client)

    return {
      statusCode: session.statusCode || 200,
      headers,
      body: JSON.stringify(session.body),
    }
  } catch (e) {
    return {
      status: e.statusCode || 500,
      headers: { 'Content-Type': 'text/plain', ...headers },
      body: e.message,
    }
  }
}

const me = async (userID, client) => {
  try {
    const { rows } = await client.query('SELECT "tokens", "need", "offer", "birthdate", "funfact", "bio", "country" FROM users WHERE username = $1', [userID])
    client.release()

    if (rows.length !== 1) {
      return {
        statusCode: 400,
        exists: false,
        error: 'No user found.',
      }
    }

    const user = rows[0]

    return {
      exists: true,
      tokens: user.tokens,
      need: user.need,
      offer: user.offer,
      birthdate: user.birthdate,
      funfact: user.funfact,
      bio: user.bio,
      country: user.country,
    }
  } catch (e) {
    return {
      statusCode: 500,
      exists: false,
      error: e.message,
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
      body: JSON.stringify(session),
    }
  } catch (e) {
    return {
      status: e.statusCode || 500,
      headers: { 'Content-Type': 'text/plain', ...headers },
      body: e.message,
    }
  }
}
