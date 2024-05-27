import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { JobService } from './job/job.service';

const jobName = process.argv[2];

async function jobBootstrap() {
  if (!jobName || !jobName.trim()) {
    console.error(`input empty (${jobName})`);
    return;
  }

  const app = await NestFactory.createApplicationContext(AppModule);
  const jobService = app.get(JobService);
  await jobService.submitJob(jobName);
}

jobBootstrap()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('job error occurred', error);
    process.exit(1);
  });
