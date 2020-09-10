const { connectMail: connect } = require('../database/db')

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
}

module.exports.getMails = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
    const client = await connect()
    const body = JSON.parse(event.body)

    console.log(body)

    await client.query('INSERT INTO schema_mail.mail VALUES($1)', [JSON.stringify(body)])
    await client.release()

    return {
      statusCode: 200,
      headers,
      body,
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
