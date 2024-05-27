import { Controller, Get, Query, Session, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { KITCHEN_MANGER_WEB_TAG } from 'src/constants/swagger';
import { LoggedInSessionType } from 'src/common/dto';
import { AuthGuard } from 'src/auth/auth.guard';

import { SearchService } from './search.service';
import {
  SearchRequestQueryDto,
  SearchResponseDto,
} from './dto/search.controller.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @ApiTags(KITCHEN_MANGER_WEB_TAG)
  @ApiOperation({ description: '글로벌 검색을 한다' })
  @ApiOkResponse({ type: SearchResponseDto })
  @UseGuards(AuthGuard)
  @Get()
  async search(
    @Query() query: SearchRequestQueryDto,
    @Session() session: LoggedInSessionType,
  ): Promise<SearchResponseDto> {
    const searchResultList = await this.searchService.search({
      operationBranchId: Number(session.LoggedInBranch.id),
      keyword: query.keyword,
    });

    return {
      totalItemCount: searchResultList.length,
      resultList: searchResultList.map((searchResult) => ({
        foodDataId: String(searchResult.foodDataId),
        name: searchResult.name,
        bld: searchResult.bld,
        utilizationStatus: searchResult.utilizationStatus,
        dateRecentServed: String(searchResult.dateRecentServed),
      })),
    };
  }
}
