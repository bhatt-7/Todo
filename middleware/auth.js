//auth middleware
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const secretKey = 'hello123';

// Middleware for verifying the JWT token
exports.authenticateToken = async (req, res, next) => {
    try {
        console.log("middleware hitted")
        //extract token
        const token = req.cookies.token
            || req.body.token
            || req.header("Authorisation").replace("Bearer ", "");
        console.log('middleware wala token', token);
        //if token missing, then return response
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'TOken is missing',
            });
        }

        //verify the token
        try {
            const decode = jwt.verify(token, secretKey);
            console.log(decode);
            req.user = decode;
            // console.log('printing decoded user in middleware', req.user);
        }
        catch (err) {
            //verification - issue
            return res.status(401).json({
                success: false,
                message: 'token is invalid',
            });
        }
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Something went wrong while validating the token',
        });
    }
}

//isAdmin middleware
exports.isAdmin = async (req, res, next) => {
    console.log('user ka role', req.user);
    if (req.user.role !== 'admin') {
        return res.status(401).json({
            success: false,
            message: 'You are not authorized to access this resource',
        });
    }
    next();
}

exports.isUser = async (req, res, next) => {
    if (req.user.role !== 'user') {
        return res.status(401).json({
            success: false,
            message: 'You are not authorized to access this resource',
        });
    }
    next();
}