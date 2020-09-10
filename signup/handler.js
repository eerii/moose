const { mail, msg } = require('./mail')
const { connect } = require('../database/db')

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
}

module.exports.signup = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
    const client = await connect()

    try {
      const req = JSON.parse(event.body)

      await client.query('INSERT INTO signup(mail) VALUES($1)', [req.mail])
      await client.release()

      const newMsg = { to: req.mail, ...msg }

      await mail.messages().send(newMsg)

      return {
        statusCode: 200,
        headers,
        body: 'User added!',
      }
    } catch (e) {
      console.log(`Failed to Add User ${e}`)

      if (e.message.startsWith('duplicate')) {
        return {
          statusCode: 409,
          headers,
          body: 'The user already exists',
        }
      }
      return {
        statusCode: e.statusCode || 500,
        headers,
        body: `Could not add user ${e}`,
      }
    }
  } catch (e) {
    console.log(`Failed to Connect Successfully ${e.message}`)

    return {
      statusCode: e.statusCode || 500,
      headers,
      body: `Could not connect to database ${e.message}`,
    }
  }
}
