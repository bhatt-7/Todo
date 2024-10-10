const express = require('express');
const { sendOtp, verifyOtp, registerUser, login, changePassword, logout, getAllUsers, deleteUser, getCurrentUser, banUser } = require('../controllers/userController');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/profile_pictures');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    }
});

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/register', upload.single('profilePicture'), registerUser);
router.post('/login', login);
router.get('/getUsers', getAllUsers);
router.get('/logout', logout)
router.put('/banUser/:id', authenticateToken, isAdmin, banUser);

router.get('/me', authenticateToken, getCurrentUser);

router.get('/getAllUsersWithRoleUser', authenticateToken, isAdmin, getAllUsers);

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname + '/../public/login.html'));
});
router.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname + '/../public/dashboard.html'));
});

router.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname + '/../public/admin.html'));
});

router.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname + '/../public/Signup.html'));
});

router.get('/verify-otp', (req, res) => {
    res.sendFile(path.join(__dirname + '/../public/verify-otp.html'));
});

router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname + '/../public/register.html'));
});

router.get('/login', (req, res) => {
    res.sendFile(path.join(__ + '/../public/login.html'));
});





// router.put('/changePassword', authenticateToken, changePassword);

// router.delete('/delete/:id', authenticateToken, isAdmin, deleteUser);

module.exports = router;
