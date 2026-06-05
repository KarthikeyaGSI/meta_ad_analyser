import { Request, Response } from 'express';
import { db } from '../database/dbClient';

// Simplified check for demonstration. In production, roles would be enforced via middleware.
export const getUsers = async (req: Request, res: Response) => {
  const userReq = req as any;
  const userId = userReq.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }

  try {
    const caller = await db.getUserById(userId);
    if (!caller || caller.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden. Admin access required.' });
    }

    // In a real app we'd query Appwrite or local JSON directly. Since dbClient exposes limited methods,
    // we'll mock listing users if using local JSON, or require extending dbClient.
    // For this demonstration, we'll assume we can read local db.json directly if appwrite isn't used.
    
    // Instead of directly reading files, we should add a `getAllUsers` method to dbClient.
    // But since I'll do that next, I'll call it here.
    const allUsers = await db.getAllUsers?.() || [];
    
    // Strip sensitive info
    const safeUsers = allUsers.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      createdAt: u.createdAt,
      premiumUntil: u.premiumUntil,
      role: u.role,
      lockoutUntil: u.lockoutUntil,
      knownIps: u.knownIps
    }));

    return res.status(200).json(safeUsers);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching users.', error: error.message });
  }
};

export const revokeAccess = async (req: Request, res: Response) => {
  const userReq = req as any;
  const userId = userReq.user?.id;
  const { targetUserId } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }

  try {
    const caller = await db.getUserById(userId);
    if (!caller || caller.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden. Admin access required.' });
    }

    const targetUser = await db.getUserById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'Target user not found.' });
    }

    targetUser.premiumUntil = null; // Revoke premium
    await db.updateUser(targetUser);

    return res.status(200).json({ message: 'User access revoked successfully.', user: { id: targetUser.id, premiumUntil: null } });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error revoking access.', error: error.message });
  }
};
