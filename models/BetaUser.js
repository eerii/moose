const mongoose = require('mongoose')

const BetaUserSchema = new mongoose.Schema({
    mail: String
})

module.exports = mongoose.model('Beta User', BetaUserSchema);