//todo Controller
const Todo = require('../models/Todo');

// Fetch all todos for the logged-in user
const getTodos = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Fetch todos for the user where isDeleted is either false or undefined
        const todos = await Todo.find({ userId, isDeleted: false });

        res.json(todos);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch todos' });
    }
};


// Fetch a todo by ID
const getTodoById = async (req, res) => {
    try {
        const userId = req.user.userId;
        const todoId = req.params.id;
        const todo = await Todo.findById(todoId);
        console.log(todo);
        if (!todo) {
            return res.status(404).json({ error: 'Todo notfound' });
        }
        // console.log(todo.userId,userId)
        if (todo.userId != userId) {
            return res.status(403).json({ error: 'Unauthorized access' });
        }
        if (todo.isDeleted) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.json(todo);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch todo' });
    }
};

// Create a new todo
const createTodo = async (req, res) => {
    try {
        const userId = req.user.userId;
        // console.log(userId)

        if (!userId) {
            return res.status(400).json({ error: 'User information missing in token.' });
        }

        const newTodo = new Todo({
            todo: req.body.todo,
            checked: false,
            userId: userId
        });

        await newTodo.save();
        res.status(201).json(newTodo);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create todo' });
    }
};


// Edit a todo
const editTodo = async (req, res) => {
    try {
        const todo = await Todo.findByIdAndUpdate(req.params.id, { todo: req.body.todo }, { new: true });
        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.json(todo);
    } catch (error) {
        res.status(500).json({ error: 'Failed to edit todo' });
    }
};

// Check/uncheck a todo
const checkTodo = async (req, res) => {
    try {
        const userId = req.user.userId;
        const todoId = req.params.id;

        const todo = await Todo.findById(todoId);
        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        if (todo.userId != userId) {
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        todo.checked = !todo.checked;
        await todo.save();

        res.json(todo);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update check status' });
    }
};

// Delete a todo

const deleteTodo = async (req, res) => {
    try {
        const userId = req.user.userId;
        const todoId = req.params.id;
        const todo = await Todo.findById(todoId);

        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        if (todo.userId != userId) {
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        todo.isDeleted = true;
        // Todo.findByIdAndUpdate(todoId, { isDeleted: true });
        await todo.save();

        console.log('deleted todo',todo);
        res.status(200).json({ message: 'Todo marked as deleted successfully', todo });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete todo' });
    }
};


module.exports = {
    getTodos,
    getTodoById,
    createTodo,
    editTodo,
    checkTodo,
    deleteTodo,
};