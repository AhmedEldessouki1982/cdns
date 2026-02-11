import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { PaginationService } from './pagination.service';
import { TOD } from '@prisma/client';

@Controller('pagination')
export class PaginationController {
  constructor(private readonly paginationService: PaginationService) {}

  //get pagination pages for front end data table
  @Get()
  async getPages(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
  ) {
    return this.paginationService.pagination(page);
  }

  //search query

  @Get('search')
  async searchItems(@Query('search') search: string): Promise<TOD[]> {
    return this.paginationService.search(search);
  }
}
