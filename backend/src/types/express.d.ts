import type { AuthIdentity } from '../auth/auth.types';

declare global {
  namespace Express {
    interface Request {
      auth?: AuthIdentity;
    }
  }
}

export {};
