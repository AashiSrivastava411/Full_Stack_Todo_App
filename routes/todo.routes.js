import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
  createSubTodo,
  updateSubTodo,
  deleteSubTodo,
} from "../controllers/todo.controller.js";

const router = Router();

router.use(verifyJWT); // every route below requires login

router.post("/", createTodo);
router.get("/", getTodos);
router.get("/:id", getTodoById);
router.put("/:id", updateTodo);
router.delete("/:id", deleteTodo);

router.post("/:todoId/subtodos", createSubTodo);
router.put("/:todoId/subtodos/:subTodoId", updateSubTodo);
router.delete("/:todoId/subtodos/:subTodoId", deleteSubTodo);

export default router;