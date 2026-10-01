import { Request, Response, NextFunction } from 'express';
import { eventService } from '../services/eventService.js';

export const getEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { city, keyword, startDate, endDate } = req.query;

    const events = await eventService.getEvents({
      city: typeof city === 'string' ? city : undefined,
      keyword: typeof keyword === 'string' ? keyword : undefined,
      startDate: typeof startDate === 'string' ? startDate : undefined,
      endDate: typeof endDate === 'string' ? endDate : undefined,
    });

    res.json({
      success: true,
      data: events,
      meta: {
        total: events.length,
        filters: { city, keyword, startDate, endDate },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getFriendsCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const friendsAttendingCount = await eventService.getEventFriendsCount(id);

    res.json({
      success: true,
      data: {
        eventId: id,
        friendsAttendingCount,
      },
    });
  } catch (error) {
    next(error);
  }
};
