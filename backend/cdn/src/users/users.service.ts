import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import { PasswordService } from 'src/auth/password.service';

import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}

  //get all users
  async getAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  //create a user
  async createNewUser(
    data: Prisma.UserCreateInput,
  ): Promise<User & { access_token: string }> {
    const hashedPasword = await this.passwordService.hash(data.password);
    const newUser = await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPasword,
        Role: 'USER',
      },
    });
    // i added this to send the token to frontend once register finished
    const token = this.jwtService.sign({
      id: newUser.id,
      email: data.email,
    });

    return {
      ...newUser,
      access_token: token,
    };
  }

  //get a user by email
  async getUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  //get user by ID
  async getUserById(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(
        `User with id ${id} not found in the database`,
      );
    }

    return user;
  }

  //delete a user
  async deleteUser(id: number): Promise<User> {
    const user = await this.prisma.user.delete({ where: { id } });

    if (!user) {
      throw new NotFoundException(
        `User with id ${id} not found in the database`,
      );
    }
    return user;
  }

  //update user information
  async updateUser(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException(
        `User with id ${id} not found in the database`,
      );
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
