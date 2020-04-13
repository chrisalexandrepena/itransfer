import { LogError } from '../../../db/entities/LogError';

class ErrorRepository {
  insertError(error: LogError): Promise<LogError> {
    return LogError.create(error).save();
  }
}

export default new ErrorRepository();
