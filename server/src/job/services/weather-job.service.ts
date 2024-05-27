import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import { JobException } from 'src/exceptions';
import { JobName } from 'src/constants';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OperationBranch } from 'src/operation-branch/entities/operation-branch.entity';
import { Weather } from 'src/weather/entities/weather.entity';
import { BLD } from 'src/common/enums';

import {
  CreateWeatherForecastDto,
  RefreshWeatherDto,
} from '../dto/weather-job.service.dto';
import { WeatherApiService } from './weather-api.service';

@Injectable()
export class WeatherJobService {
  constructor(
    @InjectRepository(OperationBranch)
    private readonly operationBranchRepository: Repository<OperationBranch>,
    @InjectRepository(Weather)
    private readonly weatherRepository: Repository<Weather>,
    private readonly weatherApiService: WeatherApiService,
  ) {}

  async refreshWeather(dto: RefreshWeatherDto) {
    const operationBranch = await this.operationBranchRepository
      .findOneByOrFail({
        id: dto.operationBranchId,
      })
      .catch(() => {
        throw new JobException(
          JobName.REFRESH_TODAY_WEATHER,
          'operationBranch not found',
        );
      });

    const bldWeatherIconList =
      await this.weatherApiService.fetchDailyBLDWeatherIcon({
        dateYYYYMMDD: dto.dateYYYYMMDD,
        latitude: operationBranch.latitude,
        longitude: operationBranch.longitude,
      });

    const weatherMinMax = await this.weatherApiService.fetchDailyWeatherMinMax({
      dateYYYYMMDD: dto.dateYYYYMMDD,
      latitude: operationBranch.latitude,
      longitude: operationBranch.longitude,
    });

    const targetWeatherList = await this.weatherRepository.findBy({
      operationBranchId: operationBranch.id,
      dateYmd: dto.dateYYYYMMDD,
    });

    if (!targetWeatherList.length) {
      throw new JobException(
        JobName.REFRESH_TODAY_WEATHER,
        'targetWeatherList not exist',
      );
    }

    const refreshedWeatherList = targetWeatherList.map((targetWeather) => {
      const bldWeatherIcon = bldWeatherIconList.find(
        (item) => item.bld === targetWeather.bld,
      );
      return {
        ...targetWeather,
        maxTemperature: weatherMinMax.maxTemperature,
        minTemperature: weatherMinMax.minTemperature,
        weatherIcon: bldWeatherIcon?.weatherIcon || targetWeather.weatherIcon,
        weatherDescription:
          bldWeatherIcon?.weatherDescription ||
          targetWeather.weatherDescription,
      };
    });

    await this.weatherRepository.save(refreshedWeatherList);
  }

  async createWeatherForecast(dto: CreateWeatherForecastDto) {
    const operationBranch = await this.operationBranchRepository
      .findOneByOrFail({
        id: dto.operationBranchId,
      })
      .catch(() => {
        throw new JobException(
          JobName.CREATE_WEATHER_FORECAST,
          'operationBranch not found',
        );
      });

    const forecastWeatherList =
      await this.weatherApiService.fetchForecastWeather({
        latitude: operationBranch.latitude,
        longitude: operationBranch.longitude,
      });

    const forecastDateYYYYMMDDList = _(forecastWeatherList)
      .map('dateYYYYMMDD')
      .uniq()
      .value();

    const targetWeatherList = await this.weatherRepository.findBy({
      operationBranchId: operationBranch.id,
      dateYmd: In(forecastDateYYYYMMDDList),
    });

    const weatherList = _(forecastDateYYYYMMDDList)
      .map((forecastDateYYYYMMDD) => [
        { bld: BLD.B, dateYYYYMMDD: forecastDateYYYYMMDD },
        { bld: BLD.L, dateYYYYMMDD: forecastDateYYYYMMDD },
        { bld: BLD.D, dateYYYYMMDD: forecastDateYYYYMMDD },
      ])
      .flatten()
      .map(({ dateYYYYMMDD, bld }) => {
        const forecastWeather = forecastWeatherList.find(
          (item) => item.dateYYYYMMDD === dateYYYYMMDD,
        );
        if (!forecastWeather) {
          throw new JobException(
            JobName.CREATE_WEATHER_FORECAST,
            'forecastWeather not found',
          );
        }

        const targetWeather = targetWeatherList.find(
          (item) => item.dateYmd === dateYYYYMMDD && item.bld === bld,
        );

        return {
          id: targetWeather?.id,
          operationBranchId: operationBranch.id,
          dateYmd: forecastWeather.dateYYYYMMDD,
          bld,
          maxTemperature: forecastWeather.maxTemperature,
          minTemperature: forecastWeather.minTemperature,
          weatherIcon: forecastWeather.weatherIcon,
          weatherDescription: forecastWeather.weatherDescription,
        };
      })
      .value();

    await this.weatherRepository.save(weatherList);
  }
}
