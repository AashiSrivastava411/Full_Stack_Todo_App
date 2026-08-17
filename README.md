# 📝 Ledger — Full Stack Todo App

> A full-stack Todo application with user authentication, MongoDB database integration, and a clean, interactive frontend.

Ledger is a productivity-focused Todo application that allows users to create and manage tasks, organize tasks with sub-todos, and keep track of their pending and completed work.

---

## 🚀 Features

- 🔐 User registration and login
- 👤 User-specific Todo management
- ➕ Create new Todo entries
- ✅ Mark Todos as completed
- ❌ Delete Todos
- 📌 Add sub-todos to tasks
- 🗂️ Organize tasks and subtasks
- 💾 Persistent data storage using MongoDB
- 🔒 Authentication middleware
- 🌐 REST API based backend
- 📱 Interactive frontend
- ⚡ Express.js backend

---

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js
- Mongoose
- MongoDB

### Authentication
- Authentication middleware
- Secure user-specific data handling

### Development Tools
- Git
- GitHub
- VS Code
- npm

---

## 📂 Project Structure

```text
Ledger/
├── controllers/
│   ├── todo.controller.js
│   └── user.controller.js
│
├── middlewares/
│   └── auth.middleware.js
│
├── models/
│   └── todos/
│       ├── todo.models.js
│       ├── sub_todo.models.js
│       └── user.models.js
│
├── public/
│   ├── index.html
│   ├── script.js
│   └── style.css
│
├── routes/
│   ├── todo.routes.js
│   └── user.routes.js
│
├── index.js
├── .gitignore
├── package.json
└── README.md

