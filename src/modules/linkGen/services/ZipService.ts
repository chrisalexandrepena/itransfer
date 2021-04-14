import { Zip } from '../../../db/entities/Zip';
import ZipRepository from '../repositories/ZipRepository';
import { Path } from '../../../db/entities/Path';

class ZipService {
  getZip(id: string): Promise<Zip | undefined> {
    return ZipRepository.getZipById(id);
  }

  insertZip(zip: Zip): Promise<Zip> {
    if (!zip.paths?.length || zip.paths.find((path) => !path.exists())) {
      throw new Error('Zip must point to valid files');
    }
    return ZipRepository.insertZip(zip);
  }

  generateAndInsertZip(...filePaths: Path[]): Promise<Zip> {
    const zip = this.generateZip(...filePaths);
    return this.insertZip(zip);
  }

  generateZip(...filePaths: Path[]): Zip {
    if (!filePaths.length || filePaths.find((path) => !path.exists())) {
      throw new Error('Zip must point to valid files');
    }
    const zip = new Zip();
    zip.paths = filePaths;
    return zip;
  }
}

export default new ZipService();
