const mongoose = require('mongoose')
const BetaUser = require('./models/BetaUser')

mongoose.Promise = global.Promise
let isConnected

const connect = () => {
    if (isConnected) {
        console.log('=> using existing database connection')
        return Promise.resolve()
    }

    console.log('=> using new database connection')
    return mongoose.connect(process.env.DB)
        .then(db => {
            isConnected = db.connections[0].readyState
        })
}

module.exports.add = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false

    connect()
        .then(() => {
            BetaUser.create(JSON.parse(event.body))
                .then(user => callback(null, {
                    statusCode: 200,
                    body: JSON.stringify(user)
                }))
                .catch(err => callback(null, {
                    statusCode: err.statusCode || 500,
                    headers: { 'Content-Type': 'text/plain' },
                    body: 'Could not create the user entry.'
                }))
        })
}