export class ProcessEyeMeasurementDto {
  volume: number;
  rawMenuItemId: number;
  rawFoodIngredientId: number | null;
}

export class ProcessFoodIngredientEyeMeasurementDto {
  volume: number;
  rawMenuItemId: number;
  rawFoodIngredientId: number;
}
export class ProcessMenuItemEyeMeasurementDto {
  volume: number;
  rawMenuItemId: number;
}

export class GetTargetFoodIngredientDto {
  rawMenuItemId: number;
  rawFoodIngredientId: number;
}

export class CreateFoodIngredientDto {
  rawMenuItemId: number;
  rawFoodIngredientId: number;
}
