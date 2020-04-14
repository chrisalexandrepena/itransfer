import ErrorRepository from '../repositories/ErrorRepository';
import { LogError } from '../../../db/entities/LogError';
import { logger } from '../logger';

class ErrorService {
  async insertError(error: LogError): Promise<void> {
    try {
      await ErrorRepository.insertError(error);
    } catch (err) {
      logger.log('error', err.stack, { json: true });
    }
  }
}

export default new ErrorService();
