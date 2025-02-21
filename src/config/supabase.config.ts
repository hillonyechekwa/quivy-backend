import { registerAs } from "@nestjs/config";

export default registerAs('supabaseOAuth', () => ({
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_PUBLIC_KEY
}))