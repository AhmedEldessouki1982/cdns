import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { PasswordService } from './password.service';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
  ) {}

  //signin
  async signIn({
    email,
    password,
  }: LoginDto): Promise<{ user: Partial<User>; access_token: string }> {
    const user = await this.userService.getUserByEmail(email);

    if (
      !user ||
      !(await this.passwordService.compare(password, user?.password))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      access_token: this.jwtService.sign({
        userId: user.id,
        email: user.email,
      }),
    };
  }
}
