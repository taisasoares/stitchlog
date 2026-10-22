import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Config, loadConfig } from '../config';
import { AppError } from '../errors/AppError';
import { PublicUserData, User } from '../users/users.entity';
import { UsersRepository } from '../users/users.repository';

const DUMMY_PASSWORD_HASH = '$2b$12$u5HE.tUQ5gUhB9KpFntBZuMxmVl.v.kfFPTFO2F.ssyqjtJXJjUn6';

type UsersLookup = Pick<UsersRepository, 'findByEmail'>;
type AuthConfig = Pick<Config, 'jwtSecret' | 'jwtExpiresIn'>;

export interface LoginResult {
  token: string;
  user: PublicUserData;
}

export class AuthService {
  constructor(
    private readonly usersRepository: UsersLookup = new UsersRepository(),
    private readonly config: AuthConfig = loadConfig(),
  ) {}

  async login(email: string, password: string): Promise<LoginResult> {
    const user = await this.usersRepository.findByEmail(email.trim().toLowerCase());
    const passwordMatches = await bcrypt.compare(
      password,
      user?.getPasswordHash() ?? DUMMY_PASSWORD_HASH,
    );

    if (!user || !passwordMatches || user.isPasswordResetRequired()) {
      throw new AppError('E-mail ou senha inválidos.', 401, 'INVALID_CREDENTIALS');
    }

    return {
      token: jwt.sign({}, this.config.jwtSecret, {
        algorithm: 'HS256',
        subject: String(user.getId()),
        expiresIn: this.config.jwtExpiresIn,
      }),
      user: user.toPublicData(),
    };
  }
}
