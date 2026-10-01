import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { rsvpService } from '../services/rsvpService.js';

export const createRsvpSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  eventId: z.string().min(1, 'Event ID is required'),
  eventSnapshot: z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    venue: z.string().default('TBA'),
    date: z.string().min(1),
    time: z.string().default('TBA'),
    city: z.string().default('Local'),
    imageUrl: z.string().default(''),
    friendsAttendingCount: z.number().default(0),
  }),
  status: z.enum(['interested', 'going']).default('interested'),
});

export const createRSVP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rsvp = await rsvpService.upsertRSVP(req.body);
    res.status(201).json({
      success: true,
      message: 'RSVP confirmed successfully',
      data: rsvp,
    });
  } catch (error) {
    next(error);
  }
};

export const getRSVPsByUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const rsvps = await rsvpService.getConfirmedRSVPsByUser(userId);
    res.json({
      success: true,
      data: rsvps,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelRSVP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await rsvpService.cancelRSVP(id);
    res.json({
      success: true,
      message: 'RSVP cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};
