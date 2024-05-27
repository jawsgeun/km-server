import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import {
  MenuItemNotFoundException,
  RawMenuNotFoundException,
  RawFoodIngredientNotFoundException,
  RawFoodIngredientInvalidException,
  MenuItemDeactivatedException,
} from 'src/exceptions';
import { VOLUME_FOOD_AMOUNT_FACTOR } from 'src/constants';
import { RawMenuItemService } from 'src/raw-food/services/raw-menu-item.service';
import { MenuItem } from 'src/menu-item/entities/menu-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RawMenuItem } from 'src/raw-food/entities/raw-menu-item.entity';
import { FoodIngredient } from 'src/food-ingredient/entities/food-ingredient.entity';
import { RawFoodIngredient } from 'src/raw-food/entities/raw-food-ingredient.entity';
import { MenuItemService } from 'src/menu-item/menu-item.service';

import {
  CreateFoodIngredientDto,
  GetTargetFoodIngredientDto,
  ProcessEyeMeasurementDto,
  ProcessFoodIngredientEyeMeasurementDto,
  ProcessMenuItemEyeMeasurementDto,
} from './dto/eye-measurement.service.dto';

@Injectable()
export class EyeMeasurementService {
  constructor(
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
    @InjectRepository(FoodIngredient)
    private readonly foodIngredientRepository: Repository<FoodIngredient>,
    @InjectRepository(RawFoodIngredient)
    private readonly rawFoodIngredientRepository: Repository<RawFoodIngredient>,
    @InjectRepository(RawMenuItem)
    private readonly rawMenuItemRepository: Repository<RawMenuItem>,
    private readonly menuItemService: MenuItemService,
    private readonly rawMenuItemService: RawMenuItemService,
  ) {}

  async processEyeMeasurement(dto: ProcessEyeMeasurementDto) {
    const menuItem = await this.menuItemRepository.findOneBy({
      rawMenuItemId: dto.rawMenuItemId,
    });
    if (!menuItem) {
      throw new MenuItemNotFoundException();
    }

    if (!menuItem.activated) {
      throw new MenuItemDeactivatedException();
    }

    if (dto.rawFoodIngredientId) {
      await this.processFoodIngredientEyeMeasurement({
        rawMenuItemId: dto.rawMenuItemId,
        rawFoodIngredientId: dto.rawFoodIngredientId,
        volume: dto.volume,
      });
    } else {
      await this.processMenuItemEyeMeasurement({
        rawMenuItemId: dto.rawMenuItemId,
        volume: dto.volume,
      });
    }

    await this.menuItemService.syncTotalRemainingAmount(menuItem.id);
  }

  async processFoodIngredientEyeMeasurement(
    dto: ProcessFoodIngredientEyeMeasurementDto,
  ) {
    const targetFoodIngredient = await this.getTargetFoodIngredient(dto);

    const rawFoodIngredient = await this.rawFoodIngredientRepository.findOneBy({
      id: dto.rawFoodIngredientId,
    });

    if (!rawFoodIngredient) {
      throw new RawFoodIngredientNotFoundException();
    }

    const remainingFoodAmount = this.calculateRemainingFoodAmount(dto.volume);

    const priceAmountPerCookQuantity =
      rawFoodIngredient.unitPriceAmount / rawFoodIngredient.cookQuantity;

    const remainingPriceAmount = Math.round(
      priceAmountPerCookQuantity * remainingFoodAmount,
    );

    targetFoodIngredient.remainingFoodAmount += remainingFoodAmount;
    targetFoodIngredient.remainingPriceAmount += remainingPriceAmount;

    await this.foodIngredientRepository.save(targetFoodIngredient);
  }

  private async getTargetFoodIngredient(dto: GetTargetFoodIngredientDto) {
    const targetFoodIngredient = await this.foodIngredientRepository.findOneBy({
      rawFoodIngredientId: dto.rawFoodIngredientId,
    });

    if (targetFoodIngredient) {
      return targetFoodIngredient;
    }

    return this.createFoodIngredient({
      rawMenuItemId: dto.rawMenuItemId,
      rawFoodIngredientId: dto.rawFoodIngredientId,
    });
  }

  async createFoodIngredient(dto: CreateFoodIngredientDto) {
    const rawMenuItem = await this.rawMenuItemRepository.findOne({
      relations: { rawFoodIngredientList: true },
      where: { id: dto.rawMenuItemId },
    });
    if (!rawMenuItem) {
      throw new RawMenuNotFoundException();
    }
    const rawFoodIngredient = rawMenuItem.rawFoodIngredientList.find(
      (rawFoodIngredient) => rawFoodIngredient.id === dto.rawFoodIngredientId,
    );
    if (!rawFoodIngredient) {
      throw new RawFoodIngredientNotFoundException();
    }
    if (!rawFoodIngredient.unitPriceAmount) {
      throw new RawFoodIngredientInvalidException(['unitPriceAmount']);
    }
    if (!rawFoodIngredient.cookQuantity) {
      throw new RawFoodIngredientInvalidException(['cookQuantity']);
    }
    const menuItem = await this.menuItemRepository.findOneBy({
      rawMenuItemId: dto.rawMenuItemId,
    });
    if (!menuItem) {
      throw new MenuItemNotFoundException();
    }

    const foodIngredientDto = this.foodIngredientRepository.create({
      name: rawFoodIngredient.name,
      remainingFoodAmount: 0,
      remainingPriceAmount: 0,
      unitPriceAmount: rawFoodIngredient.unitPriceAmount,
      servingSize: rawFoodIngredient.cookQuantity,
      menuItem,
      rawFoodIngredientId: rawFoodIngredient.id,
    });

    return this.foodIngredientRepository.save(foodIngredientDto);
  }

  async processMenuItemEyeMeasurement(dto: ProcessMenuItemEyeMeasurementDto) {
    const targetMenuItem = await this.menuItemRepository.findOneBy({
      rawMenuItemId: dto.rawMenuItemId,
    });
    if (!targetMenuItem) {
      throw new MenuItemNotFoundException();
    }

    const remainingFoodAmount = this.calculateRemainingFoodAmount(dto.volume);

    const priceAmountPerCookQuantity =
      await this.rawMenuItemService.getPriceAmountPerCookQuantity(
        dto.rawMenuItemId,
      );

    const remainingPriceAmount = Math.round(
      priceAmountPerCookQuantity * remainingFoodAmount,
    );

    targetMenuItem.remainingFoodAmount += remainingFoodAmount;
    targetMenuItem.remainingPriceAmount += remainingPriceAmount;

    await this.menuItemRepository.save(targetMenuItem);
  }

  private calculateRemainingFoodAmount(volume: number) {
    return Math.round(volume * VOLUME_FOOD_AMOUNT_FACTOR);
  }
}
