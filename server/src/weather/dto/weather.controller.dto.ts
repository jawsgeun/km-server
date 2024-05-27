import { ApiProperty } from '@nestjs/swagger';
import { BLD } from 'src/common/enums';
import { IsGte, IsYYYYMMDD } from 'src/common/decorators';
import { IsEnum } from 'class-validator';

import { type Weather } from '../entities/weather.entity';

export class WeatherResponseDto {
  @ApiProperty({ description: '날짜, 형식: YYYYMMDD' })
  dateYmd: string;
  @ApiProperty({ enum: BLD, description: '끼니' })
  bld: BLD;
  @ApiProperty({ description: '최고 기온' })
  maxTemperature: number;
  @ApiProperty({ description: '최저 기온' })
  minTemperature: number;
  @ApiProperty({ description: '날씨 아이콘' })
  weatherIcon: string;

  static of(weather: Weather): WeatherResponseDto {
    return {
      dateYmd: String(weather.dateYmd),
      bld: weather.bld,
      maxTemperature: weather.maxTemperature,
      minTemperature: weather.minTemperature,
      weatherIcon: weather.weatherIcon,
    };
  }
}

export class GetWeatherListResponseDto {
  @ApiProperty({
    type: [WeatherResponseDto],
    description: '날씨 정보',
  })
  data: WeatherResponseDto[];
}

export class GetWeatherListRequestQueryDto {
  @ApiProperty({ description: '형식: YYYYMMDD, 예시: 20231222' })
  @IsYYYYMMDD()
  dateFrom: string;

  @ApiProperty({ description: '형식: YYYYMMDD, 예시: 20231222' })
  @IsYYYYMMDD()
  @IsGte('dateFrom')
  dateTo: string;

  @ApiProperty({ enum: BLD, description: '끼니' })
  @IsEnum(BLD)
  bld: BLD;
}
