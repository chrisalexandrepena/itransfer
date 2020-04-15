import moment, { Moment } from 'moment';

export enum JobTypes {
  'deleteLink' = 'deleteLink',
}

export abstract class Job {
  abstract type: JobTypes;
  protected job: NodeJS.Timeout;

  constructor(execDate: Moment, afterCompletion: () => void) {
    if (execDate.isBefore(moment())) {
      throw new Error('job exec date has already passed');
    }
    this.job = setTimeout(() => {
      this.task().then(afterCompletion);
    }, Math.min(execDate.diff(moment()), 2147483647));
  }
  abstract async setTask(...args): Promise<void>;
  abstract async task(): Promise<void>;
}
