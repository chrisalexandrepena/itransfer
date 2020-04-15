import { Zip } from '../../../db/entities/Zip';

class ZipRepository {
  getZipById(id: string): Promise<Zip | undefined> {
    return Zip.findOne({ id });
  }
  insertZip(zip: Zip): Promise<Zip> {
    return Zip.create(zip).save();
  }
  async deleteZip(zip: Zip): Promise<void> {
    await Zip.delete({ id: zip.id });
    return;
  }
}

export default new ZipRepository();
