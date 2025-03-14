import { Injectable, ExecutionContext, CanActivate, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { NO_ACCOUNT_GUARD_KEY } from "src/decorators/no-account-guard.decorator";
import { IS_PUBLIC_KEY } from "src/decorators/public.decorator";
import { User } from "@prisma/client";
import {PrismaService} from "../prisma/prisma.service"


@Injectable()
export class AccountGuard implements CanActivate{
    constructor(
        private reflector: Reflector,
        private prisma: PrismaService
    ) { }
    

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const noAccountGuard = this.reflector.getAllAndOverride<boolean>(
            NO_ACCOUNT_GUARD_KEY,
            [context.getHandler(), context.getClass()]
        )

        const isPublic = this.reflector.getAllAndOverride<boolean>(
            IS_PUBLIC_KEY,
            [context.getHandler(), context.getClass()]
        )

        if (isPublic || noAccountGuard) {
            return true
        }


        const request = context.switchToHttp().getRequest()
        const userId = request.user?.userId

        if (!userId) {
          throw new UnauthorizedException("Invalid User Identifier");
        }
        
        let user: Partial<User> | null
        try {
          user = await this.prisma.user.findUnique({
                    where: {
                      id: userId as string
                    },
                    select: {
                      emailVerifiedAt: true,
                      accountStatus: true
                    }
              })
        } catch(error) {
            console.error("Error fetching user in AccountGuard", error)
            throw new UnauthorizedException("Internal Server Error Checking Account Status")
        }
    

        if (!user.emailVerifiedAt) {
            throw new UnauthorizedException("account not verified, please verify your email")
        }

        if (user.accountStatus !== 'ACTIVE') {
            throw new UnauthorizedException(`Account ${user.accountStatus}`)
        }

        return user.accountStatus === 'ACTIVE' &&   !!user.emailVerifiedAt
    }
}
