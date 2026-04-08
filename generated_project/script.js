// script.js - Calculator Logic and UI Rendering

// -------------------------------
// Task Model and Storage Utilities
// -------------------------------
/**
 * Represents a single todo task.
 * @class
 */
class Task {
    /**
     * @param {string} id - Unique identifier (e.g., UUID).
     * @param {string} text - Description of the task.
     * @param {boolean} completed - Completion status.
     */
    constructor(id, text, completed = false) {
        this.id = id;
        this.text = text;
        this.completed = completed;
    }
}

/**
 * Simple storage wrapper around `localStorage` for persisting tasks.
 * Provides `load` and `save` methods.
 * @type {{load: function(): Task[], save: function(Task[]): void}}
 */
const TaskStorage = {
    /**
     * Loads tasks from localStorage.
     * @returns {Task[]} Array of Task instances (empty array if none stored).
     */
    load() {
        const raw = localStorage.getItem('todoTasks');
        if (!raw) return [];
        try {
            const data = JSON.parse(raw);
            // Ensure we return Task instances
            return data.map(item => new Task(item.id, item.text, item.completed));
        } catch (e) {
            console.error('Failed to parse stored tasks:', e);
            return [];
        }
    },
    /**
     * Saves an array of Task instances to localStorage.
     * @param {Task[]} tasks - Tasks to persist.
     */
    save(tasks) {
        try {
            const json = JSON.stringify(tasks);
            localStorage.setItem('todoTasks', json);
        } catch (e) {
            console.error('Failed to save tasks:', e);
        }
    }
};

// Expose globally for other modules/scripts.
window.TaskStorage = TaskStorage;

// -------------------------------
// UI Rendering Utilities
// -------------------------------
/**
 * UI helper object for rendering tasks and managing filter UI.
 */
const UI = {
    /**
     * Current active filter name (all | active | completed).
     */
    currentFilter: 'all',

    /**
     * Render an array of Task objects into the task list.
     * @param {Task[]} tasksArray
     */
    renderTasks(tasksArray) {
        const listEl = document.getElementById('task-list');
        const template = document.getElementById('task-template');
        if (!listEl || !template) {
            console.error('Task list or template element missing in DOM');
            return;
        }
        // Clear existing list
        listEl.innerHTML = '';
        tasksArray.forEach(task => {
            const taskEl = template.cloneNode(true);
            // Remove the original id to avoid duplicates and make it visible
            taskEl.removeAttribute('id');
            taskEl.classList.remove('hidden');
            // Store task id for later reference
            taskEl.dataset.id = task.id;

            // Populate checkbox
            const checkbox = taskEl.querySelector('.toggle-complete');
            if (checkbox) checkbox.checked = task.completed;

            // Populate text and edit input
            const textSpan = taskEl.querySelector('.task-text');
            if (textSpan) textSpan.textContent = task.text;
            const editInput = taskEl.querySelector('.edit-input');
            if (editInput) editInput.value = task.text;

            listEl.appendChild(taskEl);
        });
    },

    /**
     * Update a single task element to reflect the provided task data.
     * @param {HTMLElement} taskElement - The DOM element representing the task.
     * @param {Task} task - The task data to apply.
     */
    updateTaskElement(taskElement, task) {
        if (!taskElement) return;
        const checkbox = taskElement.querySelector('.toggle-complete');
        if (checkbox) checkbox.checked = task.completed;
        const textSpan = taskElement.querySelector('.task-text');
        if (textSpan) textSpan.textContent = task.text;
        const editInput = taskElement.querySelector('.edit-input');
        if (editInput) editInput.value = task.text;
    },

    /**
     * Set the active filter button UI and store the selected filter.
     * @param {string} filterName - One of 'all', 'active', 'completed'.
     */
    setActiveFilter(filterName) {
        const buttons = document.querySelectorAll('.filter-btn');
        buttons.forEach(btn => {
            if (btn.dataset.filter === filterName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        this.currentFilter = filterName;
    }
};

// Expose UI globally for other scripts.
window.UI = UI;

// -------------------------------
// Calculator Logic
// -------------------------------

class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '';
        this.previousOperand = '';
        this.operation = undefined;
    }

    delete() {
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
    }

    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        this.currentOperand = this.currentOperand.toString() + number.toString();
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;
        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '*':
                computation = prev * current;
                break;
            case '/':  // <--- Changed to match the HTML button
                computation = prev / current;
                break;
            default:
                return;
        }
        this.currentOperand = computation;
        this.operation = undefined;
        this.previousOperand = '';
    }

    getDisplayNumber(number) {
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        this.currentOperandTextElement.innerText =
            this.getDisplayNumber(this.currentOperand);
        if (this.operation != null) {
            this.previousOperandTextElement.innerText =
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const numberButtons = document.querySelectorAll('[data-number]');
   const operationButtons = document.querySelectorAll('[data-operator]');
    const equalsButton = document.querySelector('[data-equals]');
    const deleteButton = document.querySelector('[data-delete]');
    const allClearButton = document.querySelector('[data-all-clear]');
    const previousOperandTextElement = document.querySelector('[data-previous-operand]');
    const currentOperandTextElement = document.querySelector('[data-current-operand]');

    // If calculator elements are not present, skip calculator setup.
    if (!currentOperandTextElement || !previousOperandTextElement) {
        console.warn('Calculator display elements not found; skipping calculator initialization.');
        return;
    }

    const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

    numberButtons.forEach(button => {
        button.addEventListener('click', () => {
            calculator.appendNumber(button.innerText);
            calculator.updateDisplay();
        });
    });

    operationButtons.forEach(button => {
        button.addEventListener('click', () => {
            calculator.chooseOperation(button.innerText);
            calculator.updateDisplay();
        });
    });

    equalsButton.addEventListener('click', button => {
        calculator.compute();
        calculator.updateDisplay();
    });

    allClearButton.addEventListener('click', button => {
        calculator.clear();
        calculator.updateDisplay();
    });

    deleteButton.addEventListener('click', button => {
        calculator.delete();
        calculator.updateDisplay();
    });
});
