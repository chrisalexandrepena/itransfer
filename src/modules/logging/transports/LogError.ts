import Transport from 'winston-transport';

export class LogError extends Transport {
  log(info, cb) {
    setImmediate(() => {
      this.emit('logged', info);
    });
    if (info.level === 'error') {
      console.error(info.meta.stack.replace(/^Error/gi, 'Error'.red));
      console.error('Request data'.red + ':');

      console.error({
        requestMethod: info.meta.requestMethod,
        requestUrl: info.meta.requestUrl,
        remoteIp: info.meta.remoteIp,
        date: new Date(info.meta.date),
        requestBody: info.meta.requestBody,
      });
    }
    cb();
  }
}
