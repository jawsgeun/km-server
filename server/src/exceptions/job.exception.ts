import { JobName } from 'src/constants';

export class JobException extends Error {
  constructor(jobName: JobName, message: string) {
    super(`Job Error (${jobName}), ${message}`);
  }
}
