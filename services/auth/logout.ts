import type { Response } from 'express';
import { destroySession } from '../../lib/auth/session';

export function logoutService(res: Response, signedCookie: string | undefined) {
  destroySession(res, signedCookie);
  return {
    success: true,
    message: 'Logged out successfully.',
  };
}
