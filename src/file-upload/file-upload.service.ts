import { BadRequestException, Injectable } from "@nestjs/common";
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { nanoid } from "nanoid";

@Injectable()
export class FileUploadService {
    private supabase: SupabaseClient;

    constructor(
        private config: ConfigService
    ) {
        const supabaseUrl = this.config.get<string>('SUPABASE_URL');
        const supabaseServiceKey = this.config.get<string>('SUPABASE_SERVICE_KEY'); // Use service key instead of public key
        
        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Missing Supabase configuration. Please check SUPABASE_URL and SUPABASE_SERVICE_KEY in your environment variables.');
        }
        
        this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    }

    async checkSupabaseBucket(bucketName: string, isPublic: boolean = true) {
        try {
            const { data: buckets, error: listError } = await this.supabase.storage.listBuckets();

            if (listError) {
                console.error('Error listing buckets:', listError);
                throw new Error(`Failed to list buckets: ${listError.message}`);
            }

            const bucketExists = buckets.some(bucket => bucket.name === bucketName);

            if (!bucketExists) {
                console.log(`Bucket ${bucketName} does not exist, attempting to create...`);
                const { error: createError } = await this.supabase.storage.createBucket(bucketName, {
                    public: isPublic || true
                });

                if (createError) {
                    console.error('Error creating bucket:', createError);
                    // Instead of throwing, try to use the bucket anyway
                    console.log('Attempting to proceed with upload despite bucket creation failure...');
                    return;
                }
                console.log(`Successfully created bucket: ${bucketName}`);
            }
        } catch (error) {
            console.error('Unexpected error in checkSupabaseBucket:', error);
            // Don't throw, try to proceed with the upload
            console.log('Attempting to proceed with upload despite bucket check failure...');
        }
    }

    async uploadFileToSupabase(file: Express.Multer.File, bucket: string) {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        const fileExt = file.originalname.split('.').pop();
        const fileName = `${nanoid()}.${fileExt}`;
        const fileSize = file.size;
        const filePath = `${Date.now()}_${fileName}`;
        
        
        try {
            // Try to check/create bucket but don't let it stop the upload
            await this.checkSupabaseBucket(bucket).catch(console.error);

            const { error: uploadError } = await this.supabase
                .storage
                .from(bucket)
                .upload(filePath, file.buffer, {
                    contentType: file.mimetype,
                    cacheControl: '3600'
                });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                throw new BadRequestException(`Failed to upload file: ${uploadError.message}`);
            }

            const { data: { publicUrl } } = await this.supabase.storage.from(bucket).getPublicUrl(filePath);

            console.log('public url', publicUrl)

            
            return {
                path: filePath,
                url: publicUrl,
                size: file.size,
                mimeType: file.mimetype
            };
        } catch (error) {
            console.error('File upload error:', error);
            throw new BadRequestException(error.message || 'Failed to upload file');
        }
    }
}