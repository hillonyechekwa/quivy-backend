import { Controller, Get, Post, Body, Param, HttpStatus, HttpCode, UseGuards, Req, Res, BadRequestException, UnauthorizedException, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
// import { AuthEntity } from './entities/auth.entity';
// import { UserEntity } from 'src/user/entities/user.entity';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/public.decorator';
import { LocalGuard } from 'src/guards/local.guard';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { RefreshJwtGuard } from 'src/guards/refresh.guard';
// import { UpdateAuthDto } from './dto/update-auth.dto';
import { SupabaseAuthAdapter } from 'src/supabase/supabase-auth-adapter.service';
import { SupabaseConnectorService } from 'src/supabase/supabase-connector.service';





@Controller('auth')
@ApiTags("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private supabaseConnector: SupabaseConnectorService,
    private supabaseAdapter: SupabaseAuthAdapter
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post("signup")
  async signUp(@Body() createUserDto: CreateUserDto) {
    return await this.authService.signUp(createUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalGuard)
  @Post("login")
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }


  @UseGuards(RefreshJwtGuard)
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

  @UseGuards(JwtAuthGuard)
  @Post('signout')
  signOut(@Req() req) {
    console.log('Full request object:', JSON.stringify({
      headers: req.headers,
      user: req.user,
  }, null, 2));
  
  if (!req.user) {
    console.error('User object is missing from request!');
    // Return a more helpful error instead of crashing
    throw new UnauthorizedException('Authentication failed: User not found in request');
  }
  
  const userId = req.user.userId;
  console.log('Using userId:', userId);
  return this.authService.signOut(userId);
  }

  @Post('otp-verfication')
  async generateEmailVerification(@Req() req) {
    const userId = req.user.userId
    await this.authService.generateEmailVerification(userId)

    return {
      status: "success",
      message: "sending email in a moment."
    }
  }


  @Post("verify/:otp")
  async verifyEmail(@Param('otp') otp: string, @Req() req) {
    const userId = await req.user.userId
    const result = await this.authService.verifyEmail(userId, otp)

    return {
      status: result ? 'success' : 'failure',
      message: null
    }
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
