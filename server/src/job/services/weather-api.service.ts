import { Injectable } from '@nestjs/common';
import { firstValueFrom, map } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ApiConfigService } from 'src/shared/services/api-config.service';
import { convertUnixTimestampToYYYYMMDD } from 'src/common';
import momentTimezone from 'moment-timezone';
import { BLD } from 'src/common/enums';
import Bluebird from 'bluebird';
import _ from 'lodash';
import { DEFAULT_WEATHER_ICON } from 'src/constants/weather';

import {
  BuildParamsInput,
  FetchDailyBLDWeatherIconInput,
  FetchDailyBLDWeatherIconResult,
  FetchDailyWeatherMinMaxInput,
  FetchDailyWeatherMinMaxResult,
  FetchForecastWeatherInput,
  FetchForecastWeatherResult,
  ForecastApiResult,
  RefreshTemperatureApiResult,
  RefreshWeatherIconApiResult,
} from '../dto/weather-api.service.dto';

@Injectable()
export class WeatherApiService {
  constructor(
    private readonly apiConfigService: ApiConfigService,
    private readonly httpService: HttpService,
  ) {}

  async fetchForecastWeather(
    input: FetchForecastWeatherInput,
  ): Promise<FetchForecastWeatherResult[]> {
    const url = this.apiConfigService.weatherApiConfig.url.forecast;

    const params = this.buildParams({
      latitude: input.latitude,
      longitude: input.longitude,
    });

    params.append('exclude', 'current,minutely,hourly,alerts');

    const queryString = params.toString();

    const fetchedResult = await firstValueFrom<FetchForecastWeatherResult[]>(
      this.httpService.get<ForecastApiResult>(`${url}?${queryString}`).pipe(
        map((response) => response.data.daily),
        map((daily) =>
          daily.map((item) => ({
            dateYYYYMMDD: Number(convertUnixTimestampToYYYYMMDD(item.dt)),
            maxTemperature: Math.round(item.temp.max),
            minTemperature: Math.round(item.temp.min),
            weatherIcon: item.weather[0]?.icon || DEFAULT_WEATHER_ICON,
            weatherDescription: item.weather[0]?.description || 'invalid',
          })),
        ),
      ),
    );

    return fetchedResult;
  }

  async fetchDailyBLDWeatherIcon(
    input: FetchDailyBLDWeatherIconInput,
  ): Promise<FetchDailyBLDWeatherIconResult[]> {
    const url = this.apiConfigService.weatherApiConfig.url.refreshWeatherIcon;

    const params = this.buildParams({
      latitude: input.latitude,
      longitude: input.longitude,
    });

    const date = momentTimezone.tz(
      String(input.dateYYYYMMDD),
      'YYYYMMDD',
      'Asia/Seoul',
    );

    const breakfast = date.clone().hour(8).minute(0).second(0).unix();
    const lunch = date.clone().hour(12).minute(0).second(0).unix();
    const dinner = date.clone().hour(18).minute(0).second(0).unix();

    const bldUnixTimeList = [
      { bld: BLD.B, unixTime: breakfast },
      { bld: BLD.L, unixTime: lunch },
      { bld: BLD.D, unixTime: dinner },
    ];

    const result = await Bluebird.mapSeries(
      bldUnixTimeList,
      async (bldUnixTime) => {
        const { bld, unixTime } = bldUnixTime;
        params.set('dt', String(unixTime));

        const queryString = params.toString();

        return firstValueFrom<FetchDailyBLDWeatherIconResult | null>(
          this.httpService
            .get<RefreshWeatherIconApiResult>(`${url}?${queryString}`)
            .pipe(
              map((response) => response.data.data[0]),
              map((item) =>
                item
                  ? {
                      dateYYYYMMDD: Number(
                        convertUnixTimestampToYYYYMMDD(item.dt),
                      ),
                      bld,
                      weatherIcon:
                        item.weather[0]?.icon || DEFAULT_WEATHER_ICON,
                      weatherDescription:
                        item.weather[0]?.description || 'invalid',
                    }
                  : null,
              ),
            ),
        );
      },
    );

    return _.compact(result);
  }

  async fetchDailyWeatherMinMax(
    input: FetchDailyWeatherMinMaxInput,
  ): Promise<FetchDailyWeatherMinMaxResult> {
    const url = this.apiConfigService.weatherApiConfig.url.refreshTemperature;

    const params = this.buildParams({
      latitude: input.latitude,
      longitude: input.longitude,
    });

    const year = String(input.dateYYYYMMDD).substring(0, 4);
    const month = String(input.dateYYYYMMDD).substring(4, 6);
    const day = String(input.dateYYYYMMDD).substring(6, 8);

    params.set('date', `${year}-${month}-${day}`);

    const queryString = params.toString();

    return firstValueFrom<FetchDailyWeatherMinMaxResult>(
      this.httpService
        .get<RefreshTemperatureApiResult>(`${url}?${queryString}`)
        .pipe(
          map((response) => response.data),
          map((item) => ({
            dateYYYYMMDD: input.dateYYYYMMDD,
            maxTemperature: Math.round(item.temperature.max),
            minTemperature: Math.round(item.temperature.min),
          })),
        ),
    );
  }

  private buildParams(input: BuildParamsInput) {
    const apiKey = this.apiConfigService.weatherApiConfig.apiKey;

    const params = new URLSearchParams();

    // 온도 단위 섭씨 출력을 위한 인자
    params.append('units', 'metric');

    params.append('lat', String(input.latitude));
    params.append('lon', String(input.longitude));
    params.append('appid', apiKey);
    params.append('lang', 'kr');
    return params;
  }
}
