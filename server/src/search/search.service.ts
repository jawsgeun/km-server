import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { FoodData } from 'src/food-data/entities/food-data.entity';
import _ from 'lodash';
import { BLD } from 'src/common/enums';

import { SearchDto, SearchResultDto } from './dto/search.service.dto';

const MAX_SEARCH_RESULT_COUNT = 100;

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(FoodData)
    private readonly foodDataRepository: Repository<FoodData>,
  ) {}
  async search(dto: SearchDto): Promise<SearchResultDto[]> {
    const { keyword, operationBranchId } = dto;

    const foodDataList = await this.foodDataRepository.find({
      where: {
        name: Like(`%${keyword}%`),
        operationBranchId,
      },
      take: MAX_SEARCH_RESULT_COUNT,
    });

    const searchResultList = foodDataList.map(SearchResultDto.of);
    const sortedSearchResultList = this.sortSearchResultList(searchResultList);

    return sortedSearchResultList;
  }

  private sortSearchResultList(
    resultList: SearchResultDto[],
  ): SearchResultDto[] {
    return _(resultList)
      .map((result) => {
        let bldOrder: number;
        switch (result.bld) {
          case BLD.B:
            bldOrder = 1;
          case BLD.L:
            bldOrder = 2;
          case BLD.D:
            bldOrder = 3;
        }
        return { ...result, bldOrder };
      })
      .orderBy(['dateRecentServed', 'name', 'bldOrder'], ['desc', 'asc', 'asc'])
      .value();
  }
}
