import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule],
    providers: [FileUploadService],
    exports: [FileUploadService]
})
export class FileUploadModule {}
