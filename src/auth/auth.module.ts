import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshJwtStrategy } from './strategies/refresh.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PassportModule} from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from 'src/config/jwt.config';
import refreshConfig from 'src/config/refresh.config';
import { ConfigModule } from '@nestjs/config';
import { VerificationModule } from 'src/verification/verification.module';
import { MailerModule } from 'src/mailer/mailer.module';
import { SupabaseModule } from 'src/supabase/supabase.module';



@Module({
  imports: [
    UserModule,
    PrismaModule,
    PassportModule,
    VerificationModule,
    MailerModule,
    forwardRef(() => SupabaseModule),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshConfig),
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: jwtConfig().secret,
        signOptions: { expiresIn: '5h' },
      }),
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, RefreshJwtStrategy],
  exports: [AuthService, PassportModule]
})
export class AuthModule {}
