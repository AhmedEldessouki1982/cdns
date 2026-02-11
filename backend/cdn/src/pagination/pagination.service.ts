import { BadRequestException, Injectable } from '@nestjs/common';
import { TOD } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class PaginationService {
  constructor(private readonly prisma: PrismaService) {}

  // pagination for tods table
  async pagination(page: number) {
    //calculation
    const LIMIT = 10;
    const pageNumber = Math.max(1, page);
    const skip = (pageNumber - 1) * LIMIT;

    //bring the tod count
    const todCount = await this.prisma.tOD.count({
      where: {
        system: {
          not: '',
        },
      },
    });

    //get only the open items count
    const openTod = await this.prisma.tOD.count({
      where: {
        status: true,
      },
    });

    //pagination 10 page/req
    const data = await this.prisma.tOD.findMany({
      take: 10,
      skip: skip,
      where: {
        system: {
          not: '',
        },
      },
    });

    return { todCount, data, openTod };
  }

  //serach for a tod(s)
  async search(query: string): Promise<TOD[]> {
    if (!query.trim()) {
      throw new BadRequestException('search query must be non-empty');
    }

    return await this.prisma.tOD.findMany({
      where: {
        OR: [
          {
            punchId: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            system: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },

      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      take: 50,
    });
  }

  //get the tods length and filter for closed and open items
}
