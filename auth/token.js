const jwt = require('jsonwebtoken')
const { generatePolicy } = require('./policy')

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
}

const signToken = (username, name = null, status = 0) => jwt.sign(
  { username, name, status },
  process.env.SECRET, {
    expiresIn: 86400, // 24h
  },
)

const signMiniToken = (username) => jwt.sign(
  { username },
  process.env.SECRET, {
    expiresIn: 60, // 1min
  },
)

const auth = async (event) => {
  const header = event.authorizationToken.split(' ')
  if (header.length !== 2) {
    return {
      statusCode: 400,
      headers,
      body: {
        auth: false,
        error: 'The authorization header is not valid. Make sure you are using a header.',
      },
    }
  }

  const scheme = header[0]
  const token = header[1]
  if (!scheme || scheme !== 'Bearer') {
    return {
      statusCode: 401,
      headers,
      body: {
        auth: false,
        error: 'Unauthorized: There is no valid scheme. Make sure you are using Bearer.',
      },
    }
  }
  if (!token) {
    return {
      statusCode: 401,
      headers,
      body: {
        auth: false,
        error: 'Unauthorized: There is no token.',
      },
    }
  }

  try {
    const decoded = await jwt.verify(token, process.env.SECRET)

    return await generatePolicy(decoded.username, 'Allow', event.methodArn, decoded.name)
  } catch (e) {
    return {
      statusCode: 401,
      headers,
      body: {
        auth: false,
        error: `Unauthorized: ${e.message}`,
      },
    }
  }
}

module.exports = { signToken, signMiniToken, auth }
