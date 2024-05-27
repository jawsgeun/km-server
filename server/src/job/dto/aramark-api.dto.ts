export class FetchFoodIngredientWithUnitPriceFilter {
  menuItemCode: string;
  branchCode: string;
}

export interface FetchMenuItemWithFoodIngredientFilter {
  startYYYYMMDD: string;
  endYYYYMMDD: string;
  branchCode: string;
}

export class FetchMenuItemWithFoodIngredientDto {
  CD_BRANCH: string;
  NM_BRANCH: string;
  MENU_DT: string;
  MEAL_GUBUN: string;
  MENU_NM: string;
  FORECAST_CNT: number;
  REAL_CNT: number;
  RECIPE_NM: string;
  RECIPE_CD: string;
  RECIPE_SEQ: string;
  RECIPE_AMT: number;
  INGRD_NM: string;
  INGRD_CD: string;
  COOK_QTY: number;
  UNIT: string;
}

export class FetchFoodIngredientWithUnitPriceDto {
  CD_BRANCH: string;
  RECIPE_CD: string;
  RECIPE_SEQ: string;
  INGRD_NM: string;
  INGRD_CD: string;
  INGRD_PRICE: number;
}

export class AaramarkFoodIngredientDto {
  branchCode: string;
  menuItemCode: string;
  menuItemSeq: string;
  foodIngredientName: string;
  foodIngredientCode: string;
  foodIngredientUnitPriceAmount: number;
}
