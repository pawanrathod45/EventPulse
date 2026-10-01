import { RSVPModel, RSVPDocument } from '../models/RSVP.js';
import { EventSnapshot, IRSVP } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';

export interface CreateRSVPDTO {
  userId: string;
  eventId: string;
  eventSnapshot: EventSnapshot;
  status?: 'interested' | 'going';
}

export class RSVPService {
  /**
   * Creates or updates (upserts) an RSVP record
   */
  public async upsertRSVP(data: CreateRSVPDTO): Promise<RSVPDocument> {
    const { userId, eventId, eventSnapshot, status = 'interested' } = data;

    const updated = await RSVPModel.findOneAndUpdate(
      { userId, eventId },
      {
        userId,
        eventId,
        eventSnapshot,
        status,
      },
      { upsert: true, new: true, runValidators: true }
    );

    return updated;
  }

  /**
   * Retrieves all confirmed RSVPs for a given user
   */
  public async getConfirmedRSVPsByUser(userId: string): Promise<RSVPDocument[]> {
    if (!userId) {
      throw new AppError('User ID is required', 400);
    }
    const rsvps = await RSVPModel.find({ userId }).sort({ createdAt: -1 });
    return rsvps;
  }

  /**
   * Cancels (deletes) an RSVP by ID
   */
  public async cancelRSVP(id: string): Promise<boolean> {
    const result = await RSVPModel.findByIdAndDelete(id);
    if (!result) {
      throw new AppError('RSVP record not found', 404);
    }
    return true;
  }
}

export const rsvpService = new RSVPService();
