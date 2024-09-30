// routes/todoRoutes.js
const express = require('express');
const {
    getTodos,
    getTodoById,
    createTodo,
    editTodo,
    checkTodo,
    deleteTodo,
} = require('../controllers/todoControllers');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, getTodos);
router.get('/:id', authenticateToken, getTodoById);
router.post('/', authenticateToken, createTodo);
router.put('/:id/edit', authenticateToken, editTodo);
router.put('/:id/check', authenticateToken, checkTodo);
router.delete('/:id', authenticateToken, deleteTodo);

module.exports = router;
