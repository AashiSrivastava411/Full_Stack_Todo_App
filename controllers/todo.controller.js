import { Todo } from "../models/todos/todo.models.js";
import { subTodo } from "../models/todos/sub_todo.models.js";

// Create a todo
export const createTodo = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }
    const todo = await Todo.create({
      content,
      createdBy: req.user._id,
    });
    return res.status(201).json({ message: "Todo created", todo });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all todos for logged-in user
export const getTodos = async (req, res) => {
  try {
    const todos = await Todo.find({ createdBy: req.user._id }).populate("subTodos");
    return res.status(200).json({ todos });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get single todo by id
export const getTodoById = async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    }).populate("subTodos");
    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }
    return res.status(200).json({ todo });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update todo (content or complete)
export const updateTodo = async (req, res) => {
  try {
    const { content, complete } = req.body;
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { ...(content !== undefined && { content }), ...(complete !== undefined && { complete }) },
      { new: true }
    );
    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }
    return res.status(200).json({ message: "Todo updated", todo });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete todo
export const deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }
    // also delete its subTodos
    await subTodo.deleteMany({ _id: { $in: todo.subTodos } });
    return res.status(200).json({ message: "Todo deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Add a subTodo to a todo
export const createSubTodo = async (req, res) => {
  try {
    const { content } = req.body;
    const { todoId } = req.params;
    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }
    const todo = await Todo.findOne({ _id: todoId, createdBy: req.user._id });
    if (!todo) {
      return res.status(404).json({ message: "Parent todo not found" });
    }
    const newSubTodo = await subTodo.create({
      content,
      createdBy: req.user._id,
    });
    todo.subTodos.push(newSubTodo._id);
    await todo.save();
    return res.status(201).json({ message: "SubTodo created", subTodo: newSubTodo });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update a subTodo (toggle complete / edit content)
export const updateSubTodo = async (req, res) => {
  try {
    const { content, complete } = req.body;
    const updated = await subTodo.findOneAndUpdate(
      { _id: req.params.subTodoId, createdBy: req.user._id },
      { ...(content !== undefined && { content }), ...(complete !== undefined && { complete }) },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "SubTodo not found" });
    }
    return res.status(200).json({ message: "SubTodo updated", subTodo: updated });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete a subTodo
export const deleteSubTodo = async (req, res) => {
  try {
    const { todoId, subTodoId } = req.params;
    await subTodo.findOneAndDelete({ _id: subTodoId, createdBy: req.user._id });
    await Todo.findByIdAndUpdate(todoId, { $pull: { subTodos: subTodoId } });
    return res.status(200).json({ message: "SubTodo deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};