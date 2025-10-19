class Todo {
    constructor() {
        this.tasks = this._loadFromLocalStorage();
        this.searchTerm = '';

        this.taskList = document.getElementById('task-list');
        this.addTaskForm = document.getElementById('add-task-form');
        this.taskInput = document.getElementById('new-task-input');
        this.taskDateInput = document.getElementById('new-task-date');
        this.searchInput = document.getElementById('search-input');

        this._setUpListeners();
        this.draw();
    }

    _setUpListeners() {
        this.addTaskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = this.taskInput.value;
            const date = this.taskDateInput.value;
            this.addTask(text, date);
            this.taskInput.value = '';
            this.taskDateInput.value = '';
        });

        this.searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value;
            this.draw();
        });

        this.taskList.addEventListener('click', (e) => {
            const target = e.target;
            const taskItem = target.closest('.task-item');
            if (!taskItem) return;

            const taskId = Number(taskItem.dataset.id);

            if (target.classList.contains('delete-btn')) {
                this.deleteTask(taskId);
            } else if (target.classList.contains('task-text')) {
                this.enterEditMode(taskId);
            } else if (target.classList.contains('save-btn')) {
                const textInput = taskItem.querySelector('.edit-text');
                const dateInput = taskItem.querySelector('.edit-date');
                this.saveEdit(taskId, textInput.value, dateInput.value);
            }
        });
    }

    _saveToLocalStorage() {
        localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
    }

    _loadFromLocalStorage() {
        const tasksJson = localStorage.getItem('todoTasks');
        return tasksJson ? JSON.parse(tasksJson) : [];
    }

    addTask(text, date) {
        
        const trimmedText = text.trim();
        if (trimmedText.length < 3 || trimmedText.length > 255) {
            alert('Zadanie musi mieć od 3 do 255 znaków.');
            return;
        }
        if (date && new Date(date) < new Date().setHours(0, 0, 0, 0)) {
            alert('Data nie może być z przeszłości.');
            return;
        }

        const newTask = {
            id: Date.now(),
            text: trimmedText,
            date: date || '',
            isEditing: false
        };

        this.tasks.push(newTask);
        this._saveToLocalStorage();
        this.draw();
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this._saveToLocalStorage();
        this.draw();
    }
    
    enterEditMode(id) {
        this.tasks.forEach(task => {
            task.isEditing = task.id === id;
        });
        this.draw();
    }

    saveEdit(id, newText, newDate) {
         const task = this.tasks.find(task => task.id === id);
         if (task) {
            task.text = newText.trim();
            task.date = newDate;
            task.isEditing = false;
            this._saveToLocalStorage();
            this.draw();
         }
    }

    get getFilteredTasks() {
        if (this.searchTerm.length < 2) {
            return this.tasks;
        }
        return this.tasks.filter(task =>
            task.text.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
    }
    
    draw() {
        this.taskList.innerHTML = '';
        const tasksToDraw = this.getFilteredTasks;

        tasksToDraw.forEach(task => {
            const li = document.createElement('li');
            li.className = 'task-item';
            li.dataset.id = task.id;

            if (task.isEditing) {

                li.innerHTML = `
                    <input type="text" class="edit-text" value="${task.text}">
                    <input type="date" class="edit-date" value="${task.date}">
                    <button class="save-btn">Zapisz</button>
                `;
            } else {

                let taskTextHtml = task.text;

                if (this.searchTerm.length >= 2) {
                    const regex = new RegExp(`(${this.searchTerm})`, 'gi');
                    taskTextHtml = task.text.replace(regex, `<span class="highlight">$1</span>`);
                }

                li.innerHTML = `
                    <span class="task-text">${taskTextHtml}</span>
                    ${task.date ? `<span class="task-date">${task.date}</span>` : ''}
                    <button class="delete-btn">🗑️</button>
                `;
            }

            this.taskList.appendChild(li);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Todo();
});