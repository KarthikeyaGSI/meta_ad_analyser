import { Request, Response } from 'express';
import { db } from '../database/dbClient';

// Secret admin keys for different durations
const VALID_KEYS = {
  'VERO_1MONTH': 30,
  'VERO_3MONTH': 90,
  'VERO_6MONTH': 180,
  'VERO_1YEAR': 365,
};

export const activateSubscription = async (req: Request, res: Response) => {
  const { code } = req.body;
  const userReq = req as any;
  const userId = userReq.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized. Must be logged in to activate a key.' });
  }

  if (!code) {
    return res.status(400).json({ message: 'Activation code is required.' });
  }

  // Find duration
  let daysToAdd = 0;
  for (const [key, days] of Object.entries(VALID_KEYS)) {
    if (code.toUpperCase().startsWith(key)) {
      daysToAdd = days;
      break;
    }
  }

  if (daysToAdd === 0) {
    return res.status(400).json({ message: 'Invalid or expired activation code.' });
  }

  try {
    const user = await db.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Calculate new expiration date
    let currentExpiry = new Date();
    if (user.premiumUntil) {
      const existingExpiry = new Date(user.premiumUntil);
      if (existingExpiry > currentExpiry) {
        currentExpiry = existingExpiry; // Extend from current expiration
      }
    }

    currentExpiry.setDate(currentExpiry.getDate() + daysToAdd);
    user.premiumUntil = currentExpiry.toISOString();
    
    await db.updateUser(user);

    return res.status(200).json({ 
      message: `Successfully activated ${daysToAdd} days of Premium.`,
      premiumUntil: user.premiumUntil 
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error activating subscription.', error: error.message });
  }
};
