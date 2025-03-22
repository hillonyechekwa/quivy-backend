import { Injectable, Inject, UnauthorizedException } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Strategy, ExtractJwt } from "passport-jwt"
import { ConfigType } from "@nestjs/config"
import jwtConfig from "src/config/jwt.config"
import { PayloadType } from "src/types/payload.type"
import { ConfigService } from "@nestjs/config"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @Inject(jwtConfig.KEY)
        private jwtConfiguration: ConfigType<typeof jwtConfig>,
        private readonly config: ConfigService
    ) {

        
        if (!jwtConfiguration.secret) {
            throw new Error('JWT secret is not defined');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false, // Changed to false for proper expiration checking
            secretOrKey: config.get<string>('JWT_SECRET')
        });
    }

    async validate(payload: PayloadType) {
        
        if (!payload || !payload.email || !payload.userId) {
            throw new UnauthorizedException("Invalid token payload");
        }

        // Return user object that will be attached to Request
        const user = {
            email: payload.email,
            userId: payload.userId
        };
        return user;
    }
}