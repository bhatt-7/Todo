const express = require('express');
const { sendOtp, verifyOtp, registerUser, login, changePassword, getAllUsers, deleteUser } = require('../controllers/userController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/register', registerUser);
router.post('/login', login);
router.get('/getUsers', getAllUsers);

router.put('/changePassword', authenticateToken, changePassword);

router.delete('/delete/:id', authenticateToken, isAdmin, deleteUser);

module.exports = router;
