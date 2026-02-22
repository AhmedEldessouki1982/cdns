import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  Param,
  Put,
  Body,
} from '@nestjs/common';
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

  //change the status of a tod
  //url: /pagination/change-status/:id
  @Put('change-status/:id')
  async changeTODstatus(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() body: { status: boolean; userId: number },
  ): Promise<TOD> {
    return this.paginationService.changeTODstatus(id, body.status, body.userId);
  }
}
