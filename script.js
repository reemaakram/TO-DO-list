document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".todo-form");
  const input = document.querySelector(".todo-input");
  const ul = document.querySelector(".todo-list");
  const counter = document.querySelector(".todo-counter");
  const searchInput = document.getElementById("search-input");
  const clearAllBtn = document.getElementById("clear-all-btn");

  function updateCounter() {
    const total = ul.children.length;
    counter.textContent = `Total Tasks: ${total}`;
  }

  function saveTodos() {
    const todos = [];
    ul.querySelectorAll(".todo-item").forEach(item => {
      todos.push({
        text: item.querySelector("span").textContent,
        completed: item.querySelector("input[type='checkbox']").checked
      });
    });
    localStorage.setItem("todos", JSON.stringify(todos));
  }

  function createTodoItem(todoText, completed = false) {
    const newTodo = document.createElement("li");
    newTodo.classList.add("todo-item");
    newTodo.style.display = "";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = completed;

    const textSpan = document.createElement("span");
    textSpan.textContent = todoText;
    if (completed) {
      textSpan.classList.add("todo-completed");
    }
    textSpan.style.margin = "0 8px";

    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.value = todoText;
    editInput.style.display = "none";
    editInput.style.margin = "0 8px";

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.classList.add("edit-btn");

    editBtn.addEventListener("click", () => {
      if (editBtn.textContent === "Edit") {
        textSpan.style.display = "none";
        editInput.style.display = "inline-block";
        editBtn.textContent = "Save";
      } else {
        const newText = editInput.value.trim();
        if (newText) {
          textSpan.textContent = newText;
        }
        textSpan.style.display = "inline-block";
        editInput.style.display = "none";
        editBtn.textContent = "Edit";
        saveTodos();
        applySearchFilter();
      }
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add("delete-btn");

    deleteBtn.addEventListener("click", () => {
      ul.removeChild(newTodo);
      updateCounter();
      saveTodos();
    });

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        textSpan.classList.add("todo-completed");
      } else {
        textSpan.classList.remove("todo-completed");
      }
      saveTodos();
    });

    newTodo.appendChild(checkbox);
    newTodo.appendChild(textSpan);
    newTodo.appendChild(editInput);
    newTodo.appendChild(editBtn);
    newTodo.appendChild(deleteBtn);

    return newTodo;
  }

  function loadTodos() {
    const todos = JSON.parse(localStorage.getItem("todos")) || [];
    todos.forEach(todo => {
      const todoItem = createTodoItem(todo.text, todo.completed);
      ul.appendChild(todoItem);
    });
    updateCounter();
  }

  function applySearchFilter() {
    const filter = searchInput.value.toLowerCase();
    ul.querySelectorAll(".todo-item").forEach(item => {
      const text = item.querySelector("span").textContent.toLowerCase();
      item.style.display = text.includes(filter) ? "" : "none";
    });
  }

  clearAllBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all tasks?")) {
      ul.innerHTML = "";
      localStorage.removeItem("todos");
      updateCounter();
      applySearchFilter();
    }
  });
  loadTodos();

  // Fetch 
  fetch("https://jsonplaceholder.typicode.com/todos")
    .then(response => response.json())
    .then(data => {
      // avoid duplicates
      const existingTexts = new Set(
        Array.from(ul.querySelectorAll(".todo-item span")).map(span => span.textContent)
      );

      data.forEach(todo => {
        if (!existingTexts.has(todo.title)) {
          const todoItem = createTodoItem(todo.title, todo.completed);
          ul.appendChild(todoItem);
        }
      });
      updateCounter();
      saveTodos();
      applySearchFilter();
    })
    .catch(error => console.error("Error fetching todos:", error));

  form.addEventListener("submit", e => {
    e.preventDefault();
    const todoText = input.value.trim();
    if (todoText === "") return;

    const newTodo = createTodoItem(todoText);
    ul.appendChild(newTodo);
    input.value = "";

    updateCounter();
    saveTodos();
    applySearchFilter();
  });

  searchInput.addEventListener("input", () => {
    applySearchFilter();
  });
});