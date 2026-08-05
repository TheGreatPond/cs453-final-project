import { Router } from 'express';
import { db } from '../database.js';
import {
  authenticateToken,
  requireRole
} from "../middleware/auth.js";

export const tasksRouter = Router();

tasksRouter.get(
    "/",
  authenticateToken,
  requireRole("instructor", "student"),
  async (req, res) => {
        try {
          const result = await db.query(`
              SELECT  
              id,
              title,
              course,
              student_id AS studentId,
              completed
              FROM tasks
          `,);
          if (result.rows.length !== 0){
              result.rows = result.rows.map(task => ({
                ...task,
                completed: Boolean(task.completed)
              }));
              res.json({ tasks: result.rows });
          } else{
            res.status(404).json({ error: "No task to return" });
          }          
        } catch (error) {
        console.error("Failed to load items:", error);
        next(error);
        }
    }
);

tasksRouter.get('/:id',

    authenticateToken,
    requireRole( "instructor", "student"),
    // TODO(PART 4): Add the required authentication and authorization middleware.
    async (req, res, next) => {
      const id = req.params.id;
      let result;
  // TODO(PART 4): Query req.params.id with parameterized SQL using db.query(sql, parameters).

    try {
      result = await db.query(`
        SELECT  
        id,
        title,
        course,
        student_id AS studentId,
        completed
        FROM tasks
        WHERE ID = $1
      `,
      [id]);

      } catch (error) {
        console.error("Failed to load items:", error);
        next(error);
    }
    if (result.rows.length === 0){
        res.status(404).json({ error: "Resource requested not found" });
    } else if (req.user.role == "instructor"){
        result.rows[0].completed = !!result.rows[0].completed
        res.json({ tasks: result.rows });
    } else if (req.user.sub == result.rows[0].student_id) {
        result.rows[0].completed = !!result.rows[0].completed
        res.json({ tasks: result.rows });
    } else {
          res.status(403).json({ error: "Forbidden: User is not authorized to get the task requested since it belongs another student" });
    }
  // TODO(PART 4): Return 404 when no task exists, allow instructors, and check student ownership.
  // TODO(PART 4): Return 403 for another student's task; return the task on success.
  // req.params.id, req.user.sub, req.user.role, db.query(), and next(error) are available here.
});

tasksRouter.delete(
    "/:id",
    authenticateToken,
    requireRole("instructor"),
    async (req, res, next) => {
      try {
        const result = await db.run(
            "DELETE FROM tasks WHERE id = ?",
            [req.params.id]
        );

        if (result.changes === 0) {
          return res.status(404).json({ error: "Not Found" });
        }

        return res.status(204).end();
      } catch (error) {
        return next(error);
      }
    }
);
