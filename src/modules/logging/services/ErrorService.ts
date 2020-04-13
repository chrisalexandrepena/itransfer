import ErrorRepository from '../repositories/ErrorRepository';
import { LogError } from '../../../db/entities/LogError';

class ErrorService {
  async insertError(error: LogError): Promise<LogError> {
    return await ErrorRepository.insertError(error);
  }
}

export default new ErrorService();
