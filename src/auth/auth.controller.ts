import { Controller, Get, Post, Body, Param, HttpStatus, HttpCode, UseGuards, Req, Res, BadRequestException, UnauthorizedException, Query, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/public.decorator';
import { LocalGuard } from 'src/guards/local.guard';
import {NoAccountGuard} from "src/decorators/no-account-guard.decorator";
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { RefreshJwtGuard } from 'src/guards/refresh.guard';
// import { UpdateAuthDto } from './dto/update-auth.dto';
import { SupabaseAuthAdapter } from 'src/supabase/supabase-auth-adapter.service';
import { SupabaseConnectorService } from 'src/supabase/supabase-connector.service';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPassswordDto } from './dto/reset-password.dto';





@Controller('auth')
@ApiTags("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private supabaseConnector: SupabaseConnectorService,
    private supabaseAdapter: SupabaseAuthAdapter
  ) { }
  
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post("signup")
  async signUp(@Body() createUserDto: CreateUserDto) {
    return await this.authService.signUp(createUserDto);
  }
  
  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalGuard)
  @Post("login")
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Public()
  @UseGuards(RefreshJwtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refreshToken(@CurrentUser() user) {
    try {
      const userId = user.userId
      return this.authService.refreshToken(userId);

    } catch (error) {
      throw new BadRequestException("Couldn't get token!")
    }
  }

  @Post('signout')
  signOut(@Req() req, @CurrentUser() user) {
    const userId = user.userId;
    return this.authService.signOut(userId);
  }
  
  //@UseGuards(JwtAuthGuard)
  @NoAccountGuard()
  @Post('otp-verification')
  async generateEmailVerification(@CurrentUser() user){
    const userId = user.userId
    await this.authService.generateEmailVerification(userId)

    return {
      status: "success",
      message: "sending email in a moment."
    }
  }

  //@UseGuards(JwtAuthGuard)
  @NoAccountGuard()
  @Post("verify/:otp")
  async verifyEmail(@Param('otp') otp: string, @CurrentUser() user){
    const userId = await user.userId
    const result = await this.authService.verifyEmail(userId, otp)

    return {
      status: result ? 'success' : 'failure',
      message: null
    }
  }


  @Put("change-password")
  async changePassword(@CurrentUser() user, @Body() changePassword: ChangePasswordDto) {
    return this.authService.changeCurrentUserPassword(changePassword, user.userId)
  }

  @Public()
  @Post("forgot-password")
  async forgotPassword(@Body() forgotPassword: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPassword)
  }

  @Post("reset-password")
  async resetPassword(@Body() reset: ResetPassswordDto) {
    return this.authService.resetPassword(reset)
  }


  @Public()
  @Get('google')
  async googleAuth(@Req() req, @Res() res) {
    const redirectUrl = `${req.protocol}://${req.get('host')}/auth/google/callback`
    const { data } = await this.supabaseConnector.getGoogleSignInUrl(redirectUrl)
    return res.redirect(data.url)
  }


  @Public()
  @Get('google/callback')
  async googleAuthCallback(@Query('code') code: string, @Req() req, @Res() res) {
    try {
      const {backendTokens} = await this.supabaseAdapter.handleGoogleCallback(code)

      res.cookie('auth_token', backendTokens.accessToken, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production"
      })

      res.redirect("/dashboard")//change link to clientside protected route.
     } catch (error) {
      if (error) throw error
    }
  }
}
