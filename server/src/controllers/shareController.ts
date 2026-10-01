import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { shareService } from '../services/shareService.js';

export const generateShareSchema = z.object({
  rsvpId: z.string().min(1, 'rsvpId is required'),
  userId: z.string().min(1, 'userId is required'),
});

export const generateShareLink = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await shareService.generateShareLink(req.body);
    res.status(201).json({
      success: true,
      message: 'Share link generated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const resolveShareLink = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.params;
    const { userId } = req.query;

    const result = await shareService.resolveShareLink(
      token,
      typeof userId === 'string' ? userId : undefined
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
