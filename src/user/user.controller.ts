import { Controller, Get, Post, Body, Patch, HttpStatus, HttpCode } from '@nestjs/common';
import { UserService } from './user.service';
import { NewProfileDto } from './dto/new-profile.dto';
import { updateProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';
// import { UserEntity } from './entities/user.entity';
import { Profile } from '@prisma/client';
import { ProfileEntity } from './entities/profile.entity';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';




@Controller('user')
@ApiTags('User')
export class UserController {

  constructor(private readonly userService: UserService) {}

  @HttpCode(HttpStatus.OK) 
  @ApiOkResponse({ type: ProfileEntity })
  @Get('profile')
  async userProfile(@CurrentUser() user): Promise<Profile> {
    const userId = await user.userId
    return await this.userService.getUserProfile(userId)
  }
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ProfileEntity })
  @Post('profile')
  async createProfile(@Body() profileDto: NewProfileDto, @CurrentUser() user): Promise<Profile> {
    const userId = await user.userId
    return await this.userService.createUserProfile(profileDto, userId)
  }
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ProfileEntity })
  @Patch('profile')
  async updateProfile(@Body() profileDto: updateProfileDto, @CurrentUser() user): Promise<Profile> {
    const userId = await user.userId
    return await this.userService.updateUserProfile(profileDto, userId)
  }

  // @Post('upload-profileimg/:bucket')
  // @UseInterceptors(FileInterceptor('file'))
  // async uploadProfileImage(@UploadedFile() file: Express.Multer.File, @CurrentUser() user, @Param('bucket') bucket: string) {
  //   const userId = await user.userId
  //   return await this.userService.uploadProfileImg(file, userId, bucket)
  // }

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
