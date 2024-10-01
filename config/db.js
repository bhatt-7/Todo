const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()
MONGO_URI = process.env.MONGO_URI
exports.db = async () => await mongoose.connect(MONGO_URI);