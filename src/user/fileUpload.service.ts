import { BadRequestException, Injectable } from "@nestjs/common";
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { nanoid } from "nanoid";

@Injectable()
export class FileUpload{
    private supabase: SupabaseClient

    constructor(
        private config: ConfigService
    ) {
        this.supabase = createClient(
            this.config.get<string>('SUPABASE_URL'),
            this.config.get<string>('SUPABASE_PUBLIC_KEY')
        )
    }


      async checkSupabaseBucket(bucketName: string, isPublic: boolean = true) {
          const {data: buckets, error: listError} = await this.supabase.storage.listBuckets()
    
        if (listError) {
          throw new Error("failed to list buckets")
        }
    
        const bucketExists = buckets.some(bucket => bucket.name === bucketName)
    
        if (!bucketExists) {
          const { error: createError } = await this.supabase.storage.createBucket(bucketName, {
            public: isPublic
          })
    
          if (createError) {
            throw new Error("failed to create bucket")
          }
        }
      }
    
      async uploadFile(file: Express.Multer.File, bucket:string) {
        if (!file) {
          throw new BadRequestException('No file provided')
        }
    
        const fileExt = file.originalname.split('.').pop()
        const fileName = `${nanoid()}.${fileExt}`
        const filePath = `${Date.now()}_${fileName}`
    
        this.checkSupabaseBucket(bucket)
    
        const { error } = await this.supabase
          .storage
          .from(bucket)
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            cacheControl: '3600'
                                          })
    
    
        if (error) {
          throw new BadRequestException(error.message)      
        }
    
        const {data: { publicUrl } } = await this.supabase.storage.from(bucket).getPublicUrl(filePath)
    
        // await this.prisma.profile.update({
        //   where: {
        //     userId
        //   },
        //   data: {
        //     profileImageUrl: publicUrl
        //   }
        // })
    
    
        return {
          path: filePath,
          url: publicUrl,
          size: file.size,
          mimeType: file.mimetype
        }
      }
}