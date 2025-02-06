import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { PayloadType } from 'src/types/payload';
import { UserService } from 'src/user/user.service';
import { ConfigType } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthEntity } from './entities/auth.entity';
import * as bcrypt from "bcrypt"
import * as argon2 from "argon2"
import refreshConfig from 'src/config/refresh.config';

@Injectable()
export class AuthService {
  constructor(
    @Inject(refreshConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshConfig>,
    private userService: UserService,
    private jwtService: JwtService,
    private prisma: PrismaService
  ) {}


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
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshTokenConfig)
    ])

    return {
      accessToken,
      refreshToken
    }
  }

}
