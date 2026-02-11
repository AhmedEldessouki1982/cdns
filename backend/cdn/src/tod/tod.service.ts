//src/tod/tod.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { TOD } from '@prisma/client';

@Injectable()
export class TodService {
  constructor(private readonly prisma: PrismaService) {}

  //find all TODs from db
  async findAll(): Promise<TOD[]> {
    const prismaClient = this.prisma as unknown as {
      tOD: { findMany: () => Promise<TOD[]> };
    };
    return await prismaClient.tOD.findMany();
  }
}
