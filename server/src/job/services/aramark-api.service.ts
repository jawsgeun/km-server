import { Injectable } from '@nestjs/common';
import { convertToBLD, formatYYYYMMDD } from 'src/common/utils';
import { firstValueFrom, map } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ApiConfigService } from 'src/shared/services/api-config.service';

import {
  FetchMenuItemWithFoodIngredientDto,
  FetchFoodIngredientWithUnitPriceDto,
  FetchFoodIngredientWithUnitPriceFilter,
  FetchMenuItemWithFoodIngredientFilter,
  AaramarkFoodIngredientDto,
} from '../dto/aramark-api.dto';
import { AaramarkMenuItemDto } from '../dto/aramark-job.dto';

@Injectable()
export class AramarkApiService {
  constructor(
    private readonly apiConfigService: ApiConfigService,
    private readonly httpService: HttpService,
  ) {}

  async fetchMenuItemWithFoodIngredient(
    filter: FetchMenuItemWithFoodIngredientFilter,
  ): Promise<AaramarkMenuItemDto[]> {
    const url = this.apiConfigService.aramarkConfig.url.menuItemIngredient;

    const fetchedResult = await firstValueFrom<
      FetchMenuItemWithFoodIngredientDto[]
    >(
      this.httpService
        .get<string>(
          `${url}?startDt=${filter.startYYYYMMDD}&endDt=${filter.endYYYYMMDD}&cdBranch=${filter.branchCode}`,
        )
        .pipe(map((response) => this.fixMenuDt(response.data))),
    );

    return this.convertMenuItemWithIngredientFetchResult(fetchedResult);
  }

  // aramark api v7 버전 기준 "MENU_DT":2023-10-11, 이런 식의 값이 반환되어 JSON parsing 이 어려움
  // TODO: aramark api v8 버전 업 시 수정 필요
  private fixMenuDt(content: any) {
    if (typeof content !== 'string') {
      return content;
    }
    const regex = /"MENU_DT":(\d{4}-\d{2}-\d{2})/g;

    const fixedContent = content.replace(regex, '"MENU_DT":"$1"');
    return JSON.parse(fixedContent);
  }

  private convertMenuItemWithIngredientFetchResult(
    dtoList: FetchMenuItemWithFoodIngredientDto[],
  ): AaramarkMenuItemDto[] {
    return dtoList.map((dtoItem) => {
      return {
        branchName: dtoItem.NM_BRANCH,
        branchCode: dtoItem.CD_BRANCH,
        menuDateYYYYMMDD: Number(formatYYYYMMDD(new Date(dtoItem.MENU_DT))),
        menuName: dtoItem.MENU_NM,
        BLD: convertToBLD(dtoItem.MEAL_GUBUN),
        expectedCoverCount: Number(dtoItem.FORECAST_CNT),
        actualCoverCount: Number(dtoItem.REAL_CNT),
        menuItemName: dtoItem.RECIPE_NM,
        menuItemCode: dtoItem.RECIPE_CD,
        menuItemSeq: dtoItem.RECIPE_SEQ,
        menuItemUnitPriceAmount: Number(dtoItem.RECIPE_AMT),
        foodIngredientName: dtoItem.INGRD_NM,
        foodIngredientCode: dtoItem.INGRD_CD,
        foodIngredientUnitPriceAmount: -1,
        foodIngredientAmount: Number(dtoItem.COOK_QTY),
        foodIngredientAmountUnit: dtoItem.UNIT,
      };
    });
  }

  async fetchFoodIngredientWithUnitPrice(
    filter: FetchFoodIngredientWithUnitPriceFilter,
  ) {
    const url = this.apiConfigService.aramarkConfig.url.ingredientUnitPrice;

    const { data: fetchResult } = await firstValueFrom<{
      data: FetchFoodIngredientWithUnitPriceDto[];
    }>(
      this.httpService.get(
        `${url}?recipeCd=${filter.menuItemCode}&cdBranch=${filter.branchCode}`,
      ),
    );

    return this.convertFoodIngredientWithUnitPriceFetchResult(fetchResult);
  }

  private convertFoodIngredientWithUnitPriceFetchResult(
    dtoList: FetchFoodIngredientWithUnitPriceDto[],
  ): AaramarkFoodIngredientDto[] {
    return dtoList.map((dtoItem) => {
      return {
        branchCode: dtoItem.CD_BRANCH,
        menuItemCode: dtoItem.RECIPE_CD,
        menuItemSeq: dtoItem.RECIPE_SEQ,
        foodIngredientName: dtoItem.INGRD_NM,
        foodIngredientCode: dtoItem.INGRD_CD,
        foodIngredientUnitPriceAmount: dtoItem.INGRD_PRICE || 0,
      };
    });
  }
}
