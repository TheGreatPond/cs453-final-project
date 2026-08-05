import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { db } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';
import { reportQueue } from '../reportQueue.js';

export const reportsRouter = Router();

reportsRouter.post('/', authenticateToken, async (req, res, next) => {
  try {
    // TODO(PART 5): Create a pending report job with db.createReportJob().
    // TODO(PART 5): Send { jobId, studentId } to reportQueue.
    // TODO(PART 5): Return 202 with jobId, status, and statusUrl.
    // TODO(PART 5): Do not call generateReport() from this request handler.
    const jobId = randomUUID();
    const studentId = req.user.sub;
    console.log(studentId)
    const status = "pending";
    
    console.log(db.createReportJob( {id: jobId, studentId: studentId, status: status}));
    reportQueue.send({jobId: jobId, studentId: studentId});

    return res.status(202).json({ jobId: jobId, status: status, statusUrl: `/reports/${jobId}`});
  } catch (error) {
    return next(error);
  }
});

reportsRouter.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const job = await db.getReportJob(req.params.id);
    if (!job) return res.status(404).json({ error: 'Not Found' });
    return res.json(job);
  } catch (error) {
    return next(error);
  }
});

void reportQueue;
