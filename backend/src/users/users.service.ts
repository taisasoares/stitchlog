import bcrypt from 'bcrypt';
import { AppError } from '../errors/AppError';
import { PublicUserData, User } from './users.entity';
import {
  CreateUserData,
  UpdateUserData,
  UsersRepository,
} from './users.repository';

const PASSWORD_SALT_ROUNDS = 12;

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserInput {
  name: string;
  email: string;
  password?: string;
}

type UsersDataSource = Pick<
  UsersRepository,
  'findAll' | 'findById' | 'findByEmail' | 'create' | 'update' | 'delete'
>;

type PasswordHasher = (password: string, saltRounds: number) => Promise<string>;

interface DatabaseError {
  code?: string;
  constraint?: string;
}

export class UsersService {
  constructor(
    private readonly repository: UsersDataSource = new UsersRepository(),
    private readonly hashPassword: PasswordHasher = bcrypt.hash,
  ) {}

  async listAllUsers(): Promise<PublicUserData[]> {
    const users = await this.repository.findAll();
    return users.map((user) => user.toPublicData());
  }

  async getUserById(id: number): Promise<PublicUserData> {
    const user = await this.findUserOrFail(id);
    return user.toPublicData();
  }

  async createUser(input: CreateUserInput): Promise<PublicUserData> {
    const email = this.normalizeEmail(input.email);
    await this.ensureEmailAvailable(email);

    const data: CreateUserData = {
      name: input.name.trim(),
      email,
      passwordHash: await this.hashPassword(input.password, PASSWORD_SALT_ROUNDS),
    };

    try {
      const user = await this.repository.create(data);
      return user.toPublicData();
    } catch (error) {
      this.rethrowDuplicateEmail(error);
      throw error;
    }
  }

  async updateUser(
    id: number,
    authenticatedUserId: number,
    input: UpdateUserInput,
  ): Promise<PublicUserData> {
    await this.findAuthorizedUserOrFail(id, authenticatedUserId);

    const email = this.normalizeEmail(input.email);
    await this.ensureEmailAvailable(email, id);

    const data: UpdateUserData = {
      name: input.name.trim(),
      email,
    };

    if (input.password !== undefined) {
      data.passwordHash = await this.hashPassword(input.password, PASSWORD_SALT_ROUNDS);
    }

    try {
      const user = await this.repository.update(id, data);
      if (!user) throw this.userNotFoundError();
      return user.toPublicData();
    } catch (error) {
      this.rethrowDuplicateEmail(error);
      throw error;
    }
  }

  async deleteUser(id: number, authenticatedUserId: number): Promise<void> {
    await this.findAuthorizedUserOrFail(id, authenticatedUserId);
    const deleted = await this.repository.delete(id);
    if (!deleted) throw this.userNotFoundError();
  }

  private async findUserOrFail(id: number): Promise<User> {
    const user = await this.repository.findById(id);
    if (!user) throw this.userNotFoundError();
    return user;
  }

  private async findAuthorizedUserOrFail(id: number, authenticatedUserId: number): Promise<User> {
    const user = await this.findUserOrFail(id);
    if (id !== authenticatedUserId) {
      throw new AppError(
        'Você não tem autorização para modificar este usuário.',
        403,
        'FORBIDDEN',
      );
    }
    return user;
  }

  private async ensureEmailAvailable(email: string, currentUserId?: number): Promise<void> {
    const existingUser = await this.repository.findByEmail(email);
    if (existingUser && existingUser.getId() !== currentUserId) {
      throw this.duplicateEmailError();
    }
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private rethrowDuplicateEmail(error: unknown): void {
    const databaseError = error as DatabaseError;
    if (
      databaseError?.code === '23505'
      && ['users_email_key', 'users_email_lower_key'].includes(databaseError.constraint ?? '')
    ) {
      throw this.duplicateEmailError();
    }
  }

  private duplicateEmailError(): AppError {
    return new AppError('Este e-mail já está cadastrado.', 409, 'EMAIL_ALREADY_EXISTS');
  }

  private userNotFoundError(): AppError {
    return new AppError('Usuário não encontrado.', 404, 'USER_NOT_FOUND');
  }
}
