import { ConfigModuleOptions } from "@nestjs/config"


const configuration: ConfigModuleOptions = {
    isGlobal: true,
    expandVariables: true,
    envFilePath: ['.env', '.env.local.production'],
    load: [() => ({
        database: {
            url: process.env.DATABASE_URL,
        }
    })]
}


export default configuration