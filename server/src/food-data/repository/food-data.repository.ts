import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { FoodDataNotFoundException } from 'src/exceptions';

import { FoodData } from '../entities/food-data.entity';

@Injectable()
export class FoodDataRepository extends Repository<FoodData> {
  constructor(private readonly dataSource: DataSource) {
    const repository = dataSource.getRepository<FoodData>(FoodData);
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async updateFoodData(id: number, foodDataInput: Partial<FoodData>) {
    const foodData = await this.findOneBy({ id });

    if (!foodData) {
      throw new FoodDataNotFoundException();
    }

    await this.save({ ...foodData, ...foodDataInput });
  }
}
