import { IAMClient } from "@aws-sdk/client-iam";
import { EnvironmentConfig } from "../types";
import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";
import { TestResult } from "../types/tests";

type AWSClient = "iam" | "lambda" | "sts"
type AWSClientsObject = {[key in AWSClient]: any};

export class AWSEnvironment {
    environment: EnvironmentConfig
    awsAccountNumber: string | undefined
    awsClients: AWSClientsObject
    sts: STSClient
    constructor(environment: EnvironmentConfig) {
        this.environment = environment
        this.awsClients = {
            "iam": () => new IAMClient(environment),
            "lambda": "",
            "sts": () => new STSClient(environment)
        }
        this.sts = new STSClient(environment)
    }
    getAWSClient(client: AWSClient) {
        return this.awsClients[client]()
    }
    async getAccountNumber() {
        if (this.awsAccountNumber === undefined) {
            const requestOutput = await this.sts.send(new GetCallerIdentityCommand({}))
            this.awsAccountNumber = requestOutput.Account
        }
        return this.awsAccountNumber
    }
}

export abstract class Resource {
    environment: AWSEnvironment
    loadOutput: TestResult | undefined
    constructor(environment: AWSEnvironment) {
        this.environment = environment
    }
    async load() {
        const loadOutput = await this.loadResource()
        this.loadOutput = loadOutput
        return loadOutput
    }
    abstract loadResource():Promise<TestResult>
}

export abstract class IAMResource extends Resource {
    client: IAMClient
    abstract resourceName: string
    constructor(environment: AWSEnvironment) {
        super(environment)
        this.client = environment.getAWSClient("iam")
    }
}
