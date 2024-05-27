import { BLD } from 'src/common/enums';

export class FetchForecastWeatherInput {
  latitude: number;
  longitude: number;
}

export class FetchForecastWeatherResult {
  dateYYYYMMDD: number;
  maxTemperature: number;
  minTemperature: number;
  weatherIcon: string;
  weatherDescription: string;
}

export class BuildParamsInput {
  latitude: number;
  longitude: number;
}

export class ForecastDailyItem {
  dt: number;
  temp: {
    min: number;
    max: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
}

export class ForecastApiResult {
  daily: ForecastDailyItem[];
}

export class FetchDailyBLDWeatherIconInput {
  dateYYYYMMDD: number;
  latitude: number;
  longitude: number;
}

export class FetchDailyBLDWeatherIconResult {
  dateYYYYMMDD: number;
  bld: BLD;
  weatherIcon: string;
  weatherDescription: string;
}

export class RefreshWeatherIconApiResult {
  data: Array<{
    dt: number;
    weather: Array<{
      description: string;
      icon: string;
    }>;
  }>;
}

export class FetchDailyWeatherMinMaxInput {
  dateYYYYMMDD: number;
  latitude: number;
  longitude: number;
}

export class FetchDailyWeatherMinMaxResult {
  dateYYYYMMDD: number;
  maxTemperature: number;
  minTemperature: number;
}

export class RefreshTemperatureApiResult {
  date: string;
  temperature: {
    min: number;
    max: number;
  };
}
