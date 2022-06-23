export interface EnvironmentConfig {
    credentials?: {
        secretAccessKey: string
        accessKeyId: string
        sessionToken?: string
    },
    region?: string
}
