import { Router } from 'express';
import { getUsers, getMe, updateUser } from '../controllers/user.controller.js';
import authorize from '../middlewares/auth.middleware.js';

const userRouter = Router();

userRouter.get('/', getUsers);
userRouter.get('/getMe', authorize, getMe);
userRouter.put('/update', authorize, updateUser);

export default userRouter;
