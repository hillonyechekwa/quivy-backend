import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import * as bcrypt from 'bcrypt'
import { generateOTP } from './utils/otp.utils';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VerificationService {
  private readonly minRequestIntervalMinutes = 1;
  private readonly tokenExpirationMinuites = 15;
  private readonly saltRounds = 10;


  constructor(
    private prisma: PrismaService
  ){}

  async generateOtp(userId: string, size: number = 6) {
    const now = new Date()

    const recentToken = await this.prisma.verification.findFirst({
      where: {
        userId,
        createdAt: {
          gt: new Date(now.getTime() - this.minRequestIntervalMinutes * 60 * 1000)
        }
      },
        orderBy: {
          createdAt: 'desc'
        }
    })

    if (recentToken) {
      throw new UnprocessableEntityException("please wait for a minuite before requesting a new token")
    }
    
    const otp = generateOTP(size)

    const hashedToken = await bcrypt.hash(otp, 10)

    //remove any previous otps with the same userId
    const hasVerification = await this.prisma.verification.findUnique({
      where: {
        userId
      }
    })

    if (hasVerification) {
      await this.prisma.verification.delete({
        where: {
          userId
        }
      })
    }

    await this.prisma.verification.create({
      data: {
        userId,
        token: hashedToken,
        expiresAt: new Date(Date.now() + this.tokenExpirationMinuites * 60 * 1000)
      }
    })

    return otp
  }

  async vaidateOtp(userId: string, token: string) {
    const validToken = await this.prisma.verification.findUnique({
      where: {
        userId,
        expiresAt: {
          gt: new Date()
        }
      }
    })

    if (validToken && await bcrypt.compare(validToken.token, token)) {
      await this.prisma.verification.delete({
        where: {
          id: validToken.id
        }
      })
      return true
    } else {
      return false
    }
  }

  async cleanupExpiredTokens() {}
  
  async generateWinnerRedeemCode(winnerId: string){
    const redeemCode = generateOTP(6)
    
    const updateWinnerCode = await this.prisma.winner.update({
      where: {
        id: winnerId
      },
      data: {
        uniqueCode: redeemCode
      }
    })
   return updateWinnerCode.uniqueCode 
  }
}