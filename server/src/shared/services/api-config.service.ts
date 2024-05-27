import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type TypeOrmModuleOptions } from '@nestjs/typeorm';

import {
  WeatherApiConfig,
  type AramarkConfig,
} from '../dto/api-config.service.dto';

type mysqlSessionStoreConfigOption = {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database: string;
};

@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService) {}

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isLocal(): boolean {
    return this.nodeEnv === 'local';
  }

  get isDebug(): boolean {
    const isDebug = this.configService.get<string>('DEBUG_FLAG');
    return isDebug === 'true';
  }

  get nodeEnv(): string | undefined {
    return this.configService.get<string>('NODE_ENV');
  }

  get nuvilabSlackHookUrl() {
    const url = this.configService.get<string>('NUVI_SLACK_HOOK_URL');
    if (!url) {
      throw new Error('NUVI_SLACK_HOOK_URL not found');
    }
    return url;
  }

  get aramarkConfig(): AramarkConfig {
    const ARAMARK_API_URL = this.configService.get<string>('ARAMARK_API_URL');
    const ARAMARK_API_VERSION = 'v7';

    const urlBase = `${ARAMARK_API_URL}/${ARAMARK_API_VERSION}`;
    return {
      url: {
        menuItemIngredient: `${urlBase}/menu-item-ingredient.jsp`,
        ingredientUnitPrice: `${urlBase}/ingredient-unit-price.jsp`,
      },
    };
  }

  get weatherApiConfig(): WeatherApiConfig {
    const weatherApiUrl = 'https://api.openweathermap.org/data/3.0/';
    const WEATHER_API_KEY = this.configService.get<string>('WEATHER_API_KEY');

    if (!WEATHER_API_KEY) {
      throw new Error('WEATHER_API_KEY not found');
    }

    return {
      apiKey: WEATHER_API_KEY,
      url: {
        forecast: `${weatherApiUrl}/onecall`,
        refreshTemperature: `${weatherApiUrl}/onecall/day_summary`,
        refreshWeatherIcon: `${weatherApiUrl}/onecall/timemachine`,
      },
    };
  }

  get sessionStoreSecret() {
    return this.configService.get<string>('KM_SESSION_SECRET');
  }

  get mysqlSessionStoreConfig(): mysqlSessionStoreConfigOption {
    return {
      host: this.configService.get<string>('NUVI_DB_HOST'),
      port: this.configService.get<number>('NUVI_DB_PORT'),
      user: this.configService.get<string>('NUVI_DB_USER'),
      password: this.configService.get<string>('NUVI_DB_PASSWORD'),
      database: 'kitchen_manager',
    };
  }

  get typeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: this.configService.get<string>('NUVI_DB_HOST'),
      port: this.configService.get<number>('NUVI_DB_PORT'),
      username: this.configService.get<string>('NUVI_DB_USER'),
      password: this.configService.get<string>('NUVI_DB_PASSWORD'),
      database: 'kitchen_manager',
      // entities: [__dirname + '/../**/*.entity.{js,ts}'],
      synchronize: this.isLocal,
      logging: this.isLocal || ['error'],
      autoLoadEntities: true,
    };
  }
}
