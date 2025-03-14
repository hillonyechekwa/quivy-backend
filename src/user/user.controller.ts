import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile } from '@nestjs/common';
import { UserService } from './user.service';
import { NewProfileDto } from './dto/new-profile.dto';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { UseInterceptors } from '@nestjs/common';
import { CurrentUser } from 'src/decorators/current-user.decorator';
// import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {

  constructor(private readonly userService: UserService) {}

  @Get('profile')
  async userProfile(@CurrentUser() user) {
    const userId = await user.userId
    return await this.userService.getUserProfile(userId)
  }

  @Post('create-profile')
  async createProfile(@Body() profileDto: NewProfileDto, @CurrentUser() user) {
    const userId = await user.userId
    return await this.userService.createUserProfile(profileDto, userId)
  }

  @Post('upload-profileimg/:bucket')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(@UploadedFile() file: Express.Multer.File, @CurrentUser() user, @Param('bucket') bucket: string) {
    const userId = await user.userId
    return await this.userService.uploadProfileImg(file, userId, bucket)
  }

  // @Get()
  // findAll() {
  //   return this.userService.findAll();
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id);
  // }
}
