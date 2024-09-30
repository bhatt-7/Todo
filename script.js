document.addEventListener('DOMContentLoaded', refreshWindow);

async function refreshWindow() {
    try {
        const response = await fetch('http://localhost:3000/api/todos');
        if (!response.ok) {
            throw new Error('Failed to fetch todos');
        }
        const todos = await response.json();
        const container = document.querySelector('.lists');
        container.innerHTML = '';
        todos.forEach(addTodoToDOM);
    } catch (error) {
        console.error('Error loading todos:', error);
    }
}

function addTodoToDOM(todo) {
    const container = document.querySelector('.lists');

    const div = document.createElement('div');
    div.classList.add('list');
    div.setAttribute('data-id', todo._id);

    const input = document.createElement('input');
    input.type = 'text';
    input.value = todo.todo;
    input.style.border = '0px';
    input.disabled = true;


    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.classList.add('edit-button');

    const checkButton = document.createElement('button');
    checkButton.textContent = 'Check';
    checkButton.classList.add('check-button');

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete-button');
    if (todo.checked) {
        input.style.textDecoration = 'line-through';
        input.style.color = 'red';
        editButton.disabled = true;
    }

    div.append(input, editButton, checkButton, deleteButton);
    container.insertBefore(div, container.firstChild);
}

document.querySelector('form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const todoInput = document.querySelector('input');
    const todoValue = todoInput.value.trim();
    if (!todoValue) return;

    const newTodo = { todo: todoValue };

    try {
        const response = await fetch('http://localhost:3000/api/todos/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newTodo),
        });

        if (!response.ok) {
            throw new Error('Failed to create todo');
        }

        const addedTodo = await response.json();
        addTodoToDOM(addedTodo);
        todoInput.value = '';
    } catch (error) {
        console.error('Error creating todo:', error);
    }
});

document.querySelector('.lists').addEventListener('click', async (event) => {
    const target = event.target;
    const todoDiv = target.closest('.list');
    const id = todoDiv ? todoDiv.getAttribute('data-id') : null;

    if (!id) return;

    if (target.matches('.delete-button')) {
        try {
            const response = await fetch(`http://localhost:3000/api/todos/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete todo');
            }

            todoDiv.remove();
        } catch (error) {
            console.error('Error deleting todo:', error);
        }
    } else if (target.matches('.check-button')) {
        try {
            const todoResponse = await fetch(`http://localhost:3000/api/todos/${id}`);
            console.log(todoResponse)
            if (!todoResponse.ok) {
                throw new Error('Failed to fetch todo for checking');
            }
            const todo = await todoResponse.json();
            const updatedTodo = { todo: todoResponse.todo, checked: !todo.checked };

            const checkResponse = await fetch(`http://localhost:3000/api/todos/${id}/check`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedTodo),
            });

            if (!checkResponse.ok) {
                throw new Error('Failed to update check status');
            }

            const result = await checkResponse.json();
            console.log(result);

            // Update the UI
            const inputElement = todoDiv.querySelector('input');
            inputElement.style.textDecoration = result.checked ? 'line-through' : 'none';
            document.querySelector(`div[data-id="${id}"] .check-button`).textContent = result.checked ? 'Uncheck' : 'Check';
            inputElement.style.color = result.checked ? 'red' : 'black';
            const editButton = todoDiv.querySelector('.edit-button');
            editButton.disabled = result.checked;
        } catch (error) {
            console.error('Error updating check status:', error);
        }
    } else if (target.matches('.edit-button')) {
        const inputElement = todoDiv.querySelector('input');
        if (inputElement.disabled) {
            inputElement.disabled = false;
            inputElement.focus();
            document.querySelector(`div[data-id="${id}"] .check-button`).disabled = true;
            target.textContent = 'Save';
        } else {
            const updatedTodo = { todo: inputElement.value.trim() };
            document.querySelector(`div[data-id="${id}"] .check-button`).disabled = false;
            try {
                const editResponse = await fetch(`http://localhost:3000/api/todos/${id}/edit`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedTodo),
                });

                if (!editResponse.ok) {
                    throw new Error('Failed to edit todo');
                }

                const result = await editResponse.json();
                inputElement.disabled = true;
                target.textContent = 'Edit';
            } catch (error) {
                console.error('Error editing todo:', error);
            }
        }
    }
});

refreshWindow();
