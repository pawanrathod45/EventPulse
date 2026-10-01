import { ticketmasterService } from './ticketmasterService.js';
import { ShareLinkModel } from '../models/ShareLink.js';
import { EventSnapshot } from '../types/index.js';

export class EventService {
  /**
   * Fetches events, injects aggregated friends attending count, and returns normalized schema
   */
  public async getEvents(params: {
    city?: string;
    keyword?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<EventSnapshot[]> {
    const rawEvents = await ticketmasterService.fetchEvents(params);

    if (rawEvents.length === 0) {
      return [];
    }

    const countMap = new Map<string, number>();

    // Only query ShareLink if mongoose is connected
    const mongoose = await import('mongoose');
    if (mongoose.default.connection.readyState === 1) {
      try {
        const eventIds = rawEvents.map((e) => e.id);
        const shareAggregations = await ShareLinkModel.aggregate([
          { $match: { eventId: { $in: eventIds } } },
          { $unwind: '$clickedByUserIds' },
          {
            $group: {
              _id: '$eventId',
              uniqueUsers: { $addToSet: '$clickedByUserIds' },
            },
          },
          {
            $project: {
              eventId: '$_id',
              count: { $size: '$uniqueUsers' },
            },
          },
        ]);

        for (const item of shareAggregations) {
          countMap.set(String(item.eventId), item.count);
        }
      } catch (err) {
        console.warn('[EventService] Share aggregation notice:', err);
      }
    }

    return rawEvents.map((event) => ({
      ...event,
      friendsAttendingCount: countMap.get(event.id) || 0,
    }));
  }

  /**
   * Aggregates total unique clickedByUserIds across all ShareLinks tied to this specific event
   */
  public async getEventFriendsCount(eventId: string): Promise<number> {
    const result = await ShareLinkModel.aggregate([
      { $match: { eventId } },
      { $unwind: '$clickedByUserIds' },
      {
        $group: {
          _id: '$eventId',
          uniqueUsers: { $addToSet: '$clickedByUserIds' },
        },
      },
      {
        $project: {
          count: { $size: '$uniqueUsers' },
        },
      },
    ]);

    return result.length > 0 ? result[0].count : 0;
  }
}

export const eventService = new EventService();
