import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guard/auth.guard';
import { User } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user: User;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //signIn
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signIn(@Body() { email, password }: LoginDto) {
    return this.authService.signIn({ email, password });
  }

  @UseGuards(AuthGuard)
  @Get('isAuthenticated')
  getProfile(@Request() req: AuthenticatedRequest): any {
    return req.user;
  }
}
