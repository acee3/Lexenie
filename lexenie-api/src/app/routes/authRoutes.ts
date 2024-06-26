import Router from 'express-promise-router';
import { createUser, login } from '../controllers/authController.js';

export default async function getAuthRouter() {
  const authRouter = Router();

  authRouter.post('/createUser', createUser);
  authRouter.post('/login', login);

  return authRouter;
}