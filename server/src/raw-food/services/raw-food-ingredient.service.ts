import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RawFoodIngredientNotFoundException } from 'src/exceptions';

import { RawFoodIngredient } from '../entities/raw-food-ingredient.entity';
import { FindAllByMenuItemDto } from '../dto/raw-food-ingredient.service.dto';

@Injectable()
export class RawFoodIngredientService {
  constructor(
    @InjectRepository(RawFoodIngredient)
    private readonly rawFoodIngredientRepository: Repository<RawFoodIngredient>,
  ) {}

  async findAllByMenuItem(dto: FindAllByMenuItemDto) {
    const rawMenuItemIdList = dto.rawMenuItemList.map(
      (rawMenuItem) => rawMenuItem.id,
    );
    return this.rawFoodIngredientRepository.find({
      relations: {
        rawMenuItem: true,
      },
      where: {
        rawMenuItem: {
          id: In(rawMenuItemIdList),
        },
      },
    });
  }

  async getPriceAmountPerCookQuantity(id: number) {
    const rawFoodIngredient = await this.findById(id);

    return rawFoodIngredient.unitPriceAmount / rawFoodIngredient.cookQuantity;
  }

  async findById(id: number) {
    const rawFoodIngredient = await this.rawFoodIngredientRepository.findOneBy({
      id,
    });

    if (!rawFoodIngredient) {
      throw new RawFoodIngredientNotFoundException();
    }
    return rawFoodIngredient;
  }
}
