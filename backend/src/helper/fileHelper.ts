import * as multer from 'multer';
import * as path from 'path';

export const storage = multer.diskStorage({
  destination: './uploads',
  filename: async (req, file, cb) => {
    try {
      const randomName = (num: number) =>
        Array(num)
          .fill(null)
          .map(() => Math.round(Math.random() * 16).toString(16))
          .join('');
      const formatFileName = (originalname: string) => {
        if (originalname.length >= 16) {
          return originalname.slice(0, 16);
        } else {
          const padding = randomName(16 - originalname.length);
          return originalname + padding;
        }
      };
      const extension: string = path.parse(file.originalname).ext;
      const fileName = `${randomName(32)}${formatFileName(
        file.originalname,
      )}${extension}`;
      cb(null, fileName);
    } catch (err) {
      cb(err, null);
    }
  },
});
