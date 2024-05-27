import { Injectable, Logger } from '@nestjs/common';
import { OperationBranchService } from 'src/operation-branch/services/operation-branch.service';
import Bluebird from 'bluebird';
import { getNextWeekYYYYMMDD, getYYYYMMDDUntilToday } from 'src/common/utils';
import { JobName } from 'src/constants';
import { ExternalApiService } from 'src/shared/services/external-api.service';
import { SlackChannel } from 'src/common/enums';
import moment from 'moment';

import { AramarkJobService } from './services/aramark-job.service';
import { FoodDataJobService } from './services/food-data-job.service';
import { WeatherJobService } from './services/weather-job.service';

@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);
  constructor(
    private readonly aramarkJobService: AramarkJobService,
    private readonly foodDataJobService: FoodDataJobService,
    private readonly operationBranchService: OperationBranchService,
    private readonly externalApiService: ExternalApiService,
    private readonly weatherJobService: WeatherJobService,
  ) {}

  async submitJob(jobName: string) {
    try {
      this.logger.log(`[submitJob] job START job name: ${jobName}`);
      switch (jobName) {
        case JobName.SYNC_ARAMARK_DATA:
          await this.syncAramarkData();
          break;
        case JobName.SYNC_ARAMARK_RAW_MENU:
          await this.syncAramarkRawMenu();
          break;
        case JobName.SYNC_FOOD_DATA:
          await this.syncFoodData();
          break;
        case JobName.CREATE_WEATHER_FORECAST:
          await this.createWeatherForecast();
          break;
        case JobName.REFRESH_TODAY_WEATHER:
          await this.refreshTodayWeather();
          break;
        default: {
          this.logger.error(`job not found, job name: ${jobName}`);
          throw new Error(`job not found, job name: ${jobName}`);
        }
      }
      this.logger.log(`[submitJob] job END job name: ${jobName}`);
    } catch (error) {
      await this.externalApiService.sendSlackMessage({
        message: `JOB ERROR-${jobName}\nERROR-${error.message}`,
        emoji: ':meow_disappointed:',
        channel: SlackChannel.ERROR_KMS,
      });
      throw error;
    }
  }

  async createWeatherForecast() {
    const branchList = await this.operationBranchService.findAll();
    await Bluebird.mapSeries(branchList, async (branch) => {
      this.logger.log(
        `createWeatherForecast job START branch: ${branch.name}-${branch.code}`,
      );

      await this.weatherJobService.createWeatherForecast({
        operationBranchId: branch.id,
      });

      await this.logger.log(
        `createWeatherForecast job END branch: ${branch.name}-${branch.code}`,
      );
    });
  }

  async refreshTodayWeather() {
    const branchList = await this.operationBranchService.findAll();

    const todayYYYYMMDD = moment.tz('Asia/Seoul').format('YYYYMMDD');

    await Bluebird.mapSeries(branchList, async (branch) => {
      this.logger.log(
        `refreshTodayWeather job START branch: ${branch.name}-${branch.code}`,
      );

      await this.weatherJobService.refreshWeather({
        dateYYYYMMDD: Number(todayYYYYMMDD),
        operationBranchId: branch.id,
      });

      await this.logger.log(
        `refreshTodayWeather job END branch: ${branch.name}-${branch.code}`,
      );
    });
  }

  async syncAramarkData() {
    const branchList = await this.operationBranchService.findAll();
    const targetDateList = this.getTargetDateList(JobName.SYNC_ARAMARK_DATA);

    await Bluebird.mapSeries(branchList, async (branch) => {
      await Bluebird.mapSeries(targetDateList, async (targetDateYYYYMMDD) => {
        //TODO: job 로깅 AOP 로 만들기
        this.logger.log(
          `syncAramarkData job START branch: ${branch.name}-${branch.code} targetDateYYYYMMDD: ${targetDateYYYYMMDD}`,
        );

        const needSync = await this.aramarkJobService.needSync(
          targetDateYYYYMMDD,
          branch.code,
        );

        if (needSync) {
          await this.aramarkJobService.upsertRawMenu({
            dateYYYYMMDD: targetDateYYYYMMDD,
            branchCode: branch.code,
          });

          await this.aramarkJobService.upsertRawMenuItemAndRawFoodIngredient({
            dateYYYYMMDD: targetDateYYYYMMDD,
            branchCode: branch.code,
          });
        }

        this.logger.log(
          `syncAramarkData job END branch: ${branch.name}-${branch.code} targetDateYYYYMMDD: ${targetDateYYYYMMDD}`,
        );
      });
    });
  }

  async syncAramarkRawMenu() {
    const branchList = await this.operationBranchService.findAll();
    const targetDateList = this.getTargetDateList(
      JobName.SYNC_ARAMARK_RAW_MENU,
    );

    await Bluebird.mapSeries(branchList, async (branch) => {
      await Bluebird.mapSeries(targetDateList, async (targetDateYYYYMMDD) => {
        this.logger.log(
          `syncAramarkRawMenu job START branch: ${branch.name}-${branch.code} targetDateYYYYMMDD: ${targetDateYYYYMMDD}`,
        );
        await this.aramarkJobService.upsertRawMenu({
          dateYYYYMMDD: targetDateYYYYMMDD,
          branchCode: branch.code,
        });

        this.logger.log(
          `syncAramarkRawMenu job END branch: ${branch.name}-${branch.code} targetDateYYYYMMDD: ${targetDateYYYYMMDD}`,
        );
      });
    });
  }

  async syncFoodData() {
    const branchList = await this.operationBranchService.findAll();
    await Bluebird.mapSeries(branchList, async (branch) => {
      this.logger.log(
        `syncFoodData job START branch: ${branch.name}-${branch.code}`,
      );
      await this.foodDataJobService.syncFoodData({
        operationBranchId: branch.id,
      });
      this.logger.log(
        `syncFoodData job END branch: ${branch.name}-${branch.code}`,
      );
    });
  }

  getTargetDateList(jobName: JobName) {
    switch (jobName) {
      case JobName.SYNC_ARAMARK_DATA:
        return getNextWeekYYYYMMDD();
      case JobName.SYNC_ARAMARK_RAW_MENU:
        const dayBefore = 7;
        return getYYYYMMDDUntilToday(dayBefore);
      default:
        return [];
    }
  }
}
