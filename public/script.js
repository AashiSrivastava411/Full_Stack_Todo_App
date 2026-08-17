// ---------- Config ----------
// Relative paths work as long as this file is served by the same
// Express server that exposes /api/... (i.e. dropped into /static
// and served via app.use(express.static('static'))).
const API_BASE = "/api";

// ---------- State ----------
let token = localStorage.getItem("ledger_token") || null;
let currentUser = JSON.parse(localStorage.getItem("ledger_user") || "null");
let todos = [];

// ---------- DOM refs ----------
const authScreen = document.getElementById("auth-screen");
const dashboardScreen = document.getElementById("dashboard-screen");

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const tabBtns = document.querySelectorAll(".tab-btn");
const authForms = document.querySelectorAll(".auth-form");

const usernameDisplay = document.getElementById("username-display");
const logoutBtn = document.getElementById("logout-btn");

const addTodoForm = document.getElementById("add-todo-form");
const addTodoInput = document.getElementById("add-todo-input");
const todoListEl = document.getElementById("todo-list");
const emptyState = document.getElementById("empty-state");

const statOpen = document.getElementById("stat-open");
const statClosed = document.getElementById("stat-closed");
const statTotal = document.getElementById("stat-total");

const todoTemplate = document.getElementById("todo-template");
const subTodoTemplate = document.getElementById("subtodo-template");

// ---------- API helper ----------
async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  let data = null;
  try { data = await res.json(); } catch (_) { /* no body */ }

  if (!res.ok) {
    const message = (data && data.message) || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

// ---------- Screen switching ----------
function showScreen(screen) {
  [authScreen, dashboardScreen].forEach((s) => s.classList.remove("visible"));
  screen.classList.add("visible");
}

function boot() {
  if (token && currentUser) {
    usernameDisplay.textContent = currentUser.username;
    showScreen(dashboardScreen);
    loadTodos();
  } else {
    showScreen(authScreen);
  }
}

// ---------- Auth tabs ----------
tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabBtns.forEach((b) => b.classList.remove("active"));
    authForms.forEach((f) => f.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`${btn.dataset.tab}-form`).classList.add("active");
  });
});

function setMsg(which, text, isSuccess = false) {
  const el = document.querySelector(`[data-msg="${which}"]`);
  el.textContent = text;
  el.classList.toggle("success", isSuccess);
}

// ---------- Auth actions ----------
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  setMsg("login", "");
  const form = new FormData(loginForm);
  try {
    const data = await api("/users/login", {
      method: "POST",
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    token = data.token;
    currentUser = data.user;
    localStorage.setItem("ledger_token", token);
    localStorage.setItem("ledger_user", JSON.stringify(currentUser));
    loginForm.reset();
    usernameDisplay.textContent = currentUser.username;
    showScreen(dashboardScreen);
    loadTodos();
  } catch (err) {
    setMsg("login", err.message);
  }
});

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  setMsg("register", "");
  const form = new FormData(registerForm);
  try {
    await api("/users/register", {
      method: "POST",
      body: JSON.stringify({
        username: form.get("username"),
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    setMsg("register", "Account opened — you can sign in now.", true);
    registerForm.reset();
    document.querySelector('[data-tab="login"]').click();
  } catch (err) {
    setMsg("register", err.message);
  }
});

logoutBtn.addEventListener("click", () => {
  token = null;
  currentUser = null;
  todos = [];
  localStorage.removeItem("ledger_token");
  localStorage.removeItem("ledger_user");
  showScreen(authScreen);
});

// ---------- Todo loading & rendering ----------
async function loadTodos() {
  try {
    const data = await api("/todos", { method: "GET" });
    todos = data.todos || [];
    render();
  } catch (err) {
    if (/unauthorized/i.test(err.message)) logoutBtn.click();
  }
}

function render() {
  todoListEl.innerHTML = "";
  emptyState.classList.toggle("visible", todos.length === 0);

  todos.forEach((todo, index) => {
    const node = todoTemplate.content.cloneNode(true);
    const entry = node.querySelector(".entry");
    entry.dataset.id = todo._id;
    entry.classList.toggle("done", !!todo.complete);

    node.querySelector(".entry-no").textContent = `No. ${String(index + 1).padStart(3, "0")}`;
    node.querySelector(".entry-content").textContent = todo.content;

    const subList = node.querySelector(".sub-list");
    (todo.subTodos || []).forEach((sub) => {
      if (typeof sub !== "object") return; // not populated
      subList.appendChild(renderSubEntry(todo._id, sub));
    });

    todoListEl.appendChild(node);
  });

  updateStats();
}

function renderSubEntry(todoId, sub) {
  const node = subTodoTemplate.content.cloneNode(true);
  const el = node.querySelector(".sub-entry");
  el.dataset.id = sub._id;
  el.classList.toggle("done", !!sub.complete);
  el.querySelector(".sub-content").textContent = sub.content;

  el.querySelector(".stamp").addEventListener("click", () =>
    toggleSubComplete(todoId, sub._id, !sub.complete)
  );
  el.querySelector(".delete-btn").addEventListener("click", () =>
    deleteSubTodo(todoId, sub._id)
  );

  return el;
}

function updateStats() {
  const closed = todos.filter((t) => t.complete).length;
  statOpen.textContent = todos.length - closed;
  statClosed.textContent = closed;
  statTotal.textContent = todos.length;
}

// ---------- Todo actions ----------
addTodoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const content = addTodoInput.value.trim();
  if (!content) return;
  try {
    await api("/todos", { method: "POST", body: JSON.stringify({ content }) });
    addTodoInput.value = "";
    loadTodos();
  } catch (err) {
    alert(err.message);
  }
});

todoListEl.addEventListener("click", async (e) => {
  const entry = e.target.closest(".entry");
  if (!entry) return;
  const todoId = entry.dataset.id;

  if (e.target.closest(".stamp")) {
    const isDone = entry.classList.contains("done");
    try {
      await api(`/todos/${todoId}`, {
        method: "PUT",
        body: JSON.stringify({ complete: !isDone }),
      });
      loadTodos();
    } catch (err) {
      alert(err.message);
    }
  }

  if (e.target.closest(".delete-btn") && !e.target.closest(".sub-entry")) {
    if (!confirm("Remove this entry and its sub-entries?")) return;
    try {
      await api(`/todos/${todoId}`, { method: "DELETE" });
      loadTodos();
    } catch (err) {
      alert(err.message);
    }
  }

  if (e.target.closest(".expand-btn")) {
    entry.classList.toggle("expanded");
  }
});

todoListEl.addEventListener("submit", async (e) => {
  if (!e.target.classList.contains("add-sub-form")) return;
  e.preventDefault();
  const entry = e.target.closest(".entry");
  const todoId = entry.dataset.id;
  const input = e.target.querySelector(".add-sub-input");
  const content = input.value.trim();
  if (!content) return;

  try {
    await api(`/todos/${todoId}/subtodos`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
    input.value = "";
    loadTodos();
  } catch (err) {
    alert(err.message);
  }
});

async function toggleSubComplete(todoId, subId, complete) {
  try {
    await api(`/todos/${todoId}/subtodos/${subId}`, {
      method: "PUT",
      body: JSON.stringify({ complete }),
    });
    loadTodos();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteSubTodo(todoId, subId) {
  try {
    await api(`/todos/${todoId}/subtodos/${subId}`, { method: "DELETE" });
    loadTodos();
  } catch (err) {
    alert(err.message);
  }
}

// ---------- Init ----------
boot();