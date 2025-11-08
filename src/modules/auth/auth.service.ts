import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../user/enums/user-role.enum';
import { User, UserDocument } from '../user/schemas/user.schema';

type SafeUser = Omit<User, 'password'> & { _id: string; id: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Registers a new customer account and returns a JWT for immediate use.
   */
  async register(dto: RegisterDto): Promise<{ accessToken: string; user: SafeUser }> {
    const existing = await this.userService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userService.create({
      email: dto.email,
      name: dto.name,
      password: hashedPassword,
      role: UserRole.CUSTOMER,
    });

    const accessToken = await this.signToken(user.id, user.email, user.role);
    const safeUser = user.toObject();
    delete (safeUser as { password?: string }).password;

    return { accessToken, user: safeUser as SafeUser };
  }

  /**
   * Validates user credentials for local authentication strategy.
   */
  async validateUser(email: string, password: string): Promise<UserDocument> {
    const user = await this.userService.findByEmail(email, true);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  /**
   * Issues a JWT for a successfully authenticated user.
   */
  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.validateUser(dto.email, dto.password);
    const accessToken = await this.signToken(user.id, user.email, user.role);
    return { accessToken };
  }

  /**
   * Stateless logout helper for consistent API responses.
   */
  async logout(): Promise<{ success: boolean }> {
    return { success: true };
  }

  private async signToken(id: string, email: string, role: UserRole): Promise<string> {
    const payload = { sub: id, email, role };
    const secret = this.configService.get<string>('app.jwt.secret') ?? 'changeme';
    const expiresIn = this.configService.get<string>('app.jwt.expiresIn') ?? '1h';
    return this.jwtService.signAsync(payload, { secret, expiresIn });
  }
}
