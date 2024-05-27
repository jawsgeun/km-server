import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { Weather } from './entities/weather.entity';
import { FindAllWeatherDto } from './dto/weather.service.dto';
import { WeatherResponseDto } from './dto/weather.controller.dto';

@Injectable()
export class WeatherService {
  constructor(
    @InjectRepository(Weather)
    private readonly weatherRepository: Repository<Weather>,
  ) {}

  async findAll(dto: FindAllWeatherDto) {
    const weatherList = await this.weatherRepository.findBy({
      operationBranchId: dto.operationBranchId,
      dateYmd: Between(dto.dateFromYYYYMMDD, dto.dateToYYYYMMDD),
      bld: dto.bld,
    });

    return weatherList.map(WeatherResponseDto.of);
  }
}
