import crypto from 'crypto';
import { ShareLinkModel, ShareLinkDocument } from '../models/ShareLink.js';
import { RSVPModel } from '../models/RSVP.js';
import { UserModel } from '../models/User.js';
import { config } from '../config/index.js';
import { AppError } from '../middleware/errorHandler.js';

export interface GenerateShareLinkDTO {
  rsvpId: string;
  userId: string;
}

export interface ShareResolutionResult {
  shareLink: {
    token: string;
    rsvpId: string;
    eventId: string;
    ownerUserId: string;
    clickCount: number;
    clickedByUserIds: string[];
  };
  event: any;
  ownerUser?: {
    name: string;
    avatarUrl?: string;
  };
}

export class ShareService {
  /**
   * Generates a unique short token for an RSVP
   * Validates that the user actually confirmed the RSVP
   */
  public async generateShareLink(dto: GenerateShareLinkDTO): Promise<{ token: string; shareUrl: string }> {
    const { rsvpId, userId } = dto;

    // Validate that the user actually has confirmed this RSVP
    const rsvp = await RSVPModel.findOne({ _id: rsvpId, userId });
    if (!rsvp) {
      throw new AppError('Valid confirmed RSVP not found for this user', 404);
    }

    // Check if a ShareLink already exists for this rsvpId
    let shareLink = await ShareLinkModel.findOne({ rsvpId, ownerUserId: userId });

    if (!shareLink) {
      // Generate a unique 8-character URL-safe token
      const token = crypto.randomBytes(4).toString('hex');

      shareLink = await ShareLinkModel.create({
        token,
        rsvpId: rsvp._id,
        eventId: rsvp.eventId,
        ownerUserId: userId,
        clickCount: 0,
        clickedByUserIds: [],
      });
    }

    const shareUrl = `${config.clientUrl}/invite/${shareLink.token}`;

    return {
      token: shareLink.token,
      shareUrl,
    };
  }

  /**
   * Resolves the share link, atomically increments clickCount ($inc),
   * dedupes clicking user IDs ($addToSet), and returns event and inviter details.
   */
  public async resolveShareLink(token: string, visitorUserId?: string): Promise<ShareResolutionResult> {
    if (!token) {
      throw new AppError('Share token is required', 400);
    }

    const updateOps: any = {
      $inc: { clickCount: 1 },
    };

    // Deduplicate repeat clicks by the same user
    if (visitorUserId && visitorUserId.trim()) {
      updateOps.$addToSet = { clickedByUserIds: visitorUserId.trim() };
    }

    // Atomically increment clickCount and add unique visitor
    const shareLink = await ShareLinkModel.findOneAndUpdate(
      { token },
      updateOps,
      { new: true }
    );

    if (!shareLink) {
      throw new AppError('Invite link is invalid or has expired', 404);
    }

    // Retrieve RSVP and Event snapshot
    const rsvp = await RSVPModel.findById(shareLink.rsvpId);
    if (!rsvp) {
      throw new AppError('Associated event RSVP no longer exists', 404);
    }

    // Retrieve owner information
    const owner = await UserModel.findById(shareLink.ownerUserId).lean();

    return {
      shareLink: {
        token: shareLink.token,
        rsvpId: shareLink.rsvpId,
        eventId: shareLink.eventId,
        ownerUserId: shareLink.ownerUserId,
        clickCount: shareLink.clickCount,
        clickedByUserIds: shareLink.clickedByUserIds,
      },
      event: rsvp.eventSnapshot,
      ownerUser: owner
        ? {
            name: owner.name,
            avatarUrl: owner.profile?.avatarUrl,
          }
        : undefined,
    };
  }
}

export const shareService = new ShareService();
