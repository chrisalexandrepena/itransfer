import { Job, JobTypes } from './Job';
import { Moment } from 'moment';
import LinkService from '../../../modules/linkGen/services/LinkService';

export default class DeleteLinkJob extends Job {
  type: JobTypes.deleteLink;
  constructor(execDate: Moment, param: { id?: string; hash?: string }, afterCompletion: () => void) {
    super(execDate, afterCompletion);
    this.setTask(param);
  }

  async setTask(param: { id?: string; hash?: string }) {
    const { id, hash } = param;
    if (!id && !hash) {
      throw new Error('no param was specified, need a link id or hash');
    }
    const link = await LinkService.getLink(id ? { id } : { hash });
    if (!link) {
      throw new Error('No link found');
    } else {
      this.task = () => LinkService.deleteLink(link);
    }
  }
  async task() {}
}
