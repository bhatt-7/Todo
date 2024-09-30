//user Controller
const User = require('../models/User');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const secretKey = 'hello123';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'projectera678@gmail.com',
        pass: 'fftf nlqv nrbz xtng'
    }
});

const sendOtp = async (email, name) => {
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 1 * 60 * 1000);

    let user = await User.findOne({ email });
    if (!user) {
        user = new User({ email, name, otp: { code: otp, expiresAt } });
    } else {
        user.otp = { code: otp, expiresAt };
    }

    await user.save();

    await transporter.sendMail({
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}. It will expire in 10 minutes.`
    });

    console.log(`OTP sent to ${email}: ${otp}`);
    return user;
};

exports.sendOtp = async (req, res) => {
    try {
        const { email, name } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }
        const userExist = await User.findOne({ email });
        if (userExist && userExist.isVerified) {
            return res.status(400).json({ message: 'User already verified.' });
        }
        const user = await sendOtp(email, name);

        res.status(200).json({ message: 'OTP sent successfully.', userId: user._id });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ message: 'Error sending OTP.' });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (!user.otp || !user.otp.code) {
            return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
        }

        if (Date.now() > new Date(user.otp.expiresAt).getTime()) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        if (user.otp.code !== otp) {
            return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
        }

        user.isVerified = true;
        user.otp = {};
        await user.save();

        res.status(200).json({ message: 'OTP verified successfully. You can now complete registration.' });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ message: 'Error verifying OTP.' });
    }
};

exports.registerUser = async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body;

        if (!email || !password || !confirmPassword) {
            return res.status(400).json({ message: 'Email, password, and confirm password are required.' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found. Please send OTP first.' });
        }

        if (!user.isVerified) {
            return res.status(400).json({ message: 'OTP verification required before registration.' });
        }

        if (user.password) {
            return res.status(400).json({ message: 'User already registered. Please login.' });
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        user.password = hashedPassword;
        await user.save();

        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Error registering user.' });
    }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if the user has a password
        if (!user.password) {
            return res.status(500).json({ message: 'User password not found in the database.' });
        }

        // Compare the provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Check if the user is verified
        if (!user.isVerified) {
            return res.status(400).json({ message: 'Please verify your email before logging in.' });
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: user._id, email: user.email, role: user.role, todos: user.todos }, secretKey, { expiresIn: '1h' });

        //add token to cookie using traditional method
        res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' });

        // Send token and redirection URL
        res.status(200).json({
            message: 'Login successful.',
            token,
            redirectUrl: '/welcome'
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Error during login. Please check your credentials.' });

    }
};


//change password api
exports.changePassword = async (req, res) => {
    try {
        const { email, oldPassword, newPassword, confirmPassword } = req.body;
        if (!email || !oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid old password.' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match.' });
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
        await user.save();
        res.status(200).json({ message: 'Password changed successfully.' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Error changing password.' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users.' });
    }
};

//admin can delete user from database
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        //find by id and delete the user
        await User.findByIdAndDelete(id);
        res.status(200).json({ message: 'User deleted successfully.' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user.' });
    }
}