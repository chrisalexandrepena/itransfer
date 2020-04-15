import { Job } from '../entities/Job';
import moment, { Moment } from 'moment';
import DeleteLinkJob from '../entities/DeleteLinkJob';
import randomstring from 'randomstring';
import LinkService from '../../../modules/linkGen/services/LinkService';
import { logger } from '../../../modules/logging';
import { Link } from '../../../db/entities/Link';

class JobService {
  private _jobs: { [key: string]: Job } = {};
  private generateUniqueKey() {
    let key = randomstring.generate();
    while (this.jobs.hasOwnProperty(key)) {
      key = randomstring.generate();
    }
    return key;
  }

  get jobs() {
    return this._jobs;
  }
  addDeleteLinkJob(link: Link): void {
    if (!link.expiration_date || link.expiration_date.isBefore(moment())) {
      throw new Error('link must have a valid expiration date');
    }
    const key = this.generateUniqueKey();
    this._jobs[key] = new DeleteLinkJob(link.expiration_date, link.id ? { id: link.id } : { hash: link.hash }, () => {
      delete this.jobs[key];
    });
  }
  async generateAllDeleteJobs() {
    const links = await LinkService.getLinks();
    const counter = {
      deletedLinks: 0,
      jobsCreated: 0,
    };
    for (const link of links) {
      if (link.expiration_date && link.expiration_date.isBefore(moment())) {
        await LinkService.deleteLink(link);
        counter.deletedLinks++;
      } else if (link.expiration_date) {
        this.addDeleteLinkJob(link);
        counter.jobsCreated++;
      }
    }
    logger.info(`${counter.deletedLinks} link(s) was/were deleted`);
    logger.info(`${counter.jobsCreated} job(s) was/were created`);
  }
}

export default new JobService();
