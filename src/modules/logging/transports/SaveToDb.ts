import Transport from 'winston-transport';
import ErrorService from '../services/ErrorService';
import { LogError } from '../../../db/entities/LogError';
import { logger } from '../logger';

export class SaveToDb extends Transport {
  async log(info, cb) {
    setImmediate(() => {
      this.emit('logged', info);
    });
    if (info.level === 'error') {
      const error = new LogError();
      error.stack = info.meta.stack;
      error.request_meta = {
        requestMethod: info.meta.requestMethod,
        requestBody: info.meta.requestBody,
        requestUrl: info.meta.requestUrl,
        remoteIp: info.meta.remoteIp,
        date: new Date(info.meta.date),
      };
      await ErrorService.insertError(error);
    }
    cb();
  }
}
