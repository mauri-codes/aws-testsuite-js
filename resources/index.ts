import { IAMClient } from "@aws-sdk/client-iam";
import { EnvironmentConfig } from "../types";

type AWSClient = "iam" | "lambda"
type AWSClientsObject = {[key in AWSClient]: any};

export class AWSEnvironment {
    environment: EnvironmentConfig
    awsClients: AWSClientsObject
    constructor(environment: EnvironmentConfig) {
        this.environment = environment
        this.awsClients = {
            "iam": () => new IAMClient(environment),
            "lambda": ""
        }
    }
    getAWSClient(client: AWSClient) {
        return this.awsClients[client]()
    }
}

export abstract class Resource {
    abstract load():void
}
