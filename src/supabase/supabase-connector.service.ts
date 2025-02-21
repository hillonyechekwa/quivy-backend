import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient, createClient } from '@supabase/supabase-js'

@Injectable()
export class SupabaseConnectorService {
    private supabase: SupabaseClient
    
     constructor(
        private config: ConfigService,
        
    ) {
        this.supabase = createClient(
            this.config.get<string>('SUPABASE_URL'),
            this.config.get<string>('SUPABASE_PUBLIC_KEY')
        )
    }


    async getGoogleSignInUrl(redirectUrl: string) {
        return this.supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl
            }
        })
    }

    async exchangeCodeForUserInfo(code: string) {
        const { data, error } = await this.supabase.auth.exchangeCodeForSession(code)
        if (error) throw error
        return data.user
    }
}

