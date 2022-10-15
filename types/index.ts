export interface EnvironmentConfig {
    credentials?: {
        secretAccessKey: string
        accessKeyId: string
        sessionToken?: string
    },
    region?: string
}

export interface Tag {
    Name: string
    Value: string
}
