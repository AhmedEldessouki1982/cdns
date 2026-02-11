import {
  Controller,
  Post,
  Body,
  Get,
  HttpStatus,
  HttpCode,
  Param,
  ParseIntPipe,
  Delete,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { Prisma, User } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //regiter new user
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async registerUser(@Body() registerDto: RegisterDto): Promise<User> {
    return this.usersService.createNewUser(registerDto);
  }

  //get all user
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllUsers(): Promise<User[]> {
    return this.usersService.getAllUsers();
  }

  // get a user by Id
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getUserById(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.getUserById(id);
  }

  //delete user by Id
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.deleteUser(+id);
  }

  //update user by Id
  @Patch(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Prisma.UserUpdateInput,
  ): Promise<User> {
    return this.usersService.updateUser(id, data);
  }
}
