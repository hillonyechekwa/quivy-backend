import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FileUpload } from './fileUpload.service';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService, FileUpload],
  exports: [UserService, FileUpload],
})
export class UserModule {}
