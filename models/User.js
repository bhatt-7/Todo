const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false // Name will be optional in the first step
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: false // Password will be provided in the final registration step
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        code: {
            type: String,
            required: false
        },
        expiresAt: {
            type: Date,
            required: false
        }
    },
    todos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Todo'
    }],

},
    {
        timestamps: true,
    }

);

module.exports = mongoose.model('User', userSchema);
