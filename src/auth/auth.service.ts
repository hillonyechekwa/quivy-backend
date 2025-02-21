import { Inject, Injectable, NotFoundException, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { PayloadType } from 'src/types/payload.type';
import { UserService } from 'src/user/user.service';
import { ConfigType } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthEntity } from './entities/auth.entity';
import { VerificationService } from 'src/verification/verification.service';
import { MailerService } from 'src/mailer/mailer.service';
import * as bcrypt from "bcrypt"
import * as argon2 from "argon2"
import refreshConfig from 'src/config/refresh.config'
import jwtConfig from 'src/config/jwt.config';



@Injectable()
export class AuthService {
  constructor(
    @Inject(refreshConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshConfig>,
    private userService: UserService,
    private jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private jwtConfiguration: ConfigType<typeof jwtConfig>,
    private prisma: PrismaService,
    private verificationService: VerificationService,
    private EmailService: MailerService
  ) {
    console.log('Service secret:', this.jwtConfiguration.secret);
  }


  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email)
    if(!user) throw new UnauthorizedException("user not found")

    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if (!isPasswordMatch) {
      throw new UnauthorizedException("Invalid Credentials!")
    }

    return {
      userId: user.id
    }
  }
  
  async login(loginDto: LoginDto): Promise<AuthEntity>{
    const user = await this.userService.findOneAuth(loginDto)

    if (!user) {
      throw new UnauthorizedException("User not found!")
    }

    if (!loginDto.password) {
      //TODO:handle google login auth here
      //TODO: fit supabase google and apple login in here.
    }

    const passwordMatched = await bcrypt.compare(loginDto.password, user.password)

    if(!passwordMatched) throw new UnauthorizedException("Invalid Credentials!")

    if (passwordMatched) {
      delete user.password

      const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email)
      const hashedRefreshToken = await argon2.hash(refreshToken)

      await this.userService.updateHashedRefreshToken(user.id, hashedRefreshToken)

      return {
        user: {
          userId: user.id,
          email: user.email
        },
        backendTokens: {
          accessToken,
          refreshToken
        }
      }
    } else {
      throw new UnauthorizedException("couldn't sign in, credentials don't match!!")
    }
  }

  async signUp(createUserDto: CreateUserDto): Promise<AuthEntity>{
    const user = await this.userService.createUser(createUserDto)
    const {accessToken, refreshToken} = await this.generateTokens(user.id, user.email)

    const hashedRefreshToken = await argon2.hash(refreshToken)

    await this.userService.updateHashedRefreshToken(user.id, hashedRefreshToken)

    return {
      user: {
        userId: user.id,
        email: user.email
      },
      backendTokens: {
        accessToken,
        refreshToken
      }
    }

  }

  async signOut(userId: string) {
    return await this.userService.updateHashedRefreshToken(userId, null)
   }
  
  async validateRefreshToken(userId: string, refreshToken: string) {
    const user = await this.userService.findById(userId)

    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException("Invalid Refresh Token!!")
    }

    const refreshTokenMatches = await argon2.verify(user.hashedRefreshToken, refreshToken)

    if (!refreshTokenMatches) {
      throw new UnauthorizedException("Invalid Refresh Token")
    }

    return {
      email: user.email,
      userId: user.id
    }
   }

  async refreshToken(userId: string) {
    const user = await this.userService.findOne(userId)
    const { accessToken, refreshToken } = await this.generateTokens(userId, user.email)
    const hashedRefreshToken = await argon2.hash(refreshToken)
    await this.userService.updateHashedRefreshToken(userId, hashedRefreshToken)
    return {
      accessToken,
      refreshToken
    }
  }

  async generateTokens(userId: string, email: string) {
    const payload: PayloadType = { userId, email }
    console.log('PowerShell JWT_SECRET:', process.env.JWT_SECRET);
    console.log(jwtConfig().secret)
    console.log('Signing with secret:', this.jwtConfiguration.secret);
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshTokenConfig)
    ])

    //  const accessToken = this.jwtService.sign(payload, {
    //   secret: jwtConfig().secret,
    //   expiresIn: '5h',
    // });
    // const refreshToken = this.jwtService.sign(payload, {
    //   secret: this.refreshTokenConfig.secret,
    //   expiresIn: '7d',
    // });

    console.log('Access token generated (first 10 chars):', accessToken.substring(0, 10) + '...');

    return {
      accessToken,
      refreshToken
    }
  }


  async generateEmailVerification(userId) {
    const user = await this.userService.findById(userId)
    if (!user) {
      throw new NotFoundException('User not found!')
    }

    if (user.emailVerifiedAt) {
      throw new UnprocessableEntityException("User already verified")
    }

    const otp = await this.verificationService.generateOtp(user.id)
    //email service implementation

    await this.EmailService.sendMail({
      subject: `Quivy - Account Verification`,
      sender: `Quivy <onboarding@resend.dev>`,
      recipients: [user.email],
      html: `<p>Hi${user.email.split('@')[0]},</p><p>You may verify your Quivy account using the following OTP: <br /><span style="font-size:24px; font-weight: 700;">${otp}</span></p><p>Regards,<br />Quivy</p>`
    })
  }

  async verifyEmail(userId: string, token: string) {
    const user = await this.userService.findById(userId)

    if (!user) {
      throw new UnprocessableEntityException("Invalid or Expired OTP")
    }


    if (user.emailVerifiedAt) {
      throw new UnprocessableEntityException('Account already verified')
    }


    const isValid = await this.verificationService.vaidateOtp(user.id, token)

    if (!isValid) {
      throw new UnprocessableEntityException("Invalid or Expired OTP")
    }
    const newDate = new Date()
    await this.userService.updateEmailVerifiedAt(user.id, newDate)

    return (true)
  }

  async sendPasswordResetEmail(){}
  async sendPasswordChangedEmail(){}

}
