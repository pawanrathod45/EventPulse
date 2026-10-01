import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';

export const getUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await UserModel.find().sort({ createdAt: 1 }).lean();
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id).lean();
    if (!user) {
      throw new AppError('User not found', 404);
    }
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
