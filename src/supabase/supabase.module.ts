import { forwardRef, Module } from '@nestjs/common';
import { SupabaseAuthAdapter } from './supabase-auth-adapter.service';
import { SupabaseConnectorService } from './supabase-connector.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';


@Module({
    imports: [ConfigModule, UserModule, forwardRef(() => AuthModule)],
    providers: [SupabaseAuthAdapter, SupabaseConnectorService],
    exports: [SupabaseAuthAdapter, SupabaseConnectorService, SupabaseModule]
})
export class SupabaseModule {}
