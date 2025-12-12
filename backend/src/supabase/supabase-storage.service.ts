import { Injectable, BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SupabaseStorageService {
  private supabase: SupabaseClient;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY'),
    );
    this.bucketName =
      this.configService.get<string>('SUPABASE_BUCKET_NAME') ||
      'blog-post-images';
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `posts/${fileName}`;

    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new BadRequestException(
        `Failed to upload post image: ${error.message}`,
      );
    }

    const { data: urlData } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }

  async deleteImage(imageUrl: string): Promise<void> {
    if (!imageUrl) return;

    try {
      //get file path from URL
      const urlParts = imageUrl.split(`${this.bucketName}/`);
      if (urlParts.length < 2) return;

      const filePath = urlParts[1];

      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        console.error(`Failed to delete image: ${error.message}`);
      }
    } catch (error) {
      console.error(
        `Something went wrong when deleting image: ${error.message}`,
      );
    }
  }
}
