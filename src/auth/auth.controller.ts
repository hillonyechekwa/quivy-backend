import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode, UseGuards, Req, Res, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { AuthEntity } from './entities/auth.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/public.decorator';
import { LocalGuard } from 'src/guards/local/local.guard';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Controller('auth')
@ApiTags("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post("signup")
  async signUp(@Body() createUserDto: CreateUserDto) {
    return await this.authService.signUp(createUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post("login")
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }


  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refreshToken(@Req() req) {
    try {
      const userId = req.user.userId
      return this.authService.refreshToken(userId);

    } catch (error) {
      console.error(error.message)
      throw new BadRequestException("Couldn't get token!")
    }
  }

  @Post('signout')
  update(@Req() req) {
    const userId = req.user.userId
    return this.authService.signOut(userId);
  }
}
