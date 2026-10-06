// src/cloudinary/cloudinary.service.ts
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_KEY,
      api_secret: process.env.CLOUDINARY_SECRET,
    });
  }

  // hàm upload nhận file từ multer (bộ nhớ), trả về URL
  uploadImage(file: Express.Multer.File, folder = 'products'): Promise<string> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) return reject(error);
          if (!result)
            return reject(new Error('Cloudinary không trả về kết quả'));
          resolve(result.secure_url); // 👈 URL lưu vào DB
        },
      );
      Readable.from(file.buffer).pipe(upload);
    });
  }

  // tiện thể làm luôn hàm xoá ảnh (dùng khi xoá/sửa sản phẩm)
  async deleteImage(imageUrl: string) {
    // lấy public_id từ URL: .../upload/v123/products/abc.jpg → products/abc
    const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
    return cloudinary.uploader.destroy(publicId);
  }
}
