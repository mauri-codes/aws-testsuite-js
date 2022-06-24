import { AWSEnvironment, IAMResource } from "..";
import {
    Policy,
    PolicyVersion,
    GetPolicyCommand,
    GetPolicyVersionCommand
} from "@aws-sdk/client-iam";
import { PolicyIdentifier } from "../../types/IAM";

export class ManagedPolicy extends IAMResource {
    arn: string | undefined
    name: string | undefined
    policyData: Policy | undefined
    policyDocument: PolicyVersion | undefined
    constructor(environment: AWSEnvironment, identifier: PolicyIdentifier) {
        super(environment)
        const {policyArn, policyName} = identifier
        if (policyArn) {
            this.arn = policyArn
            this.name = policyArn.split("/").pop()
        }
        if (policyName) {
            this.name = policyName
        }
    }
    async getPolicy() {
        const params = {
            PolicyArn: await this.getArn()
        }
        const requestOutput = await this.client.send(new GetPolicyCommand(params))
        this.policyData = requestOutput.Policy
        return this.policyData
    }
    async getPolicyDocument(versionId: string) {
        const params = {
            PolicyArn: await this.getArn(),
            VersionId: versionId
        }
        const requestOutput = await this.client.send(new GetPolicyVersionCommand(params))
        this.policyDocument = requestOutput.PolicyVersion
        return this.policyDocument
    }
    async getArn() {
        if (this.arn === undefined) {
            const account = await this.environment.getAccountNumber()
            const path = ""
            this.arn = `arn:aws:iam::${account}:policy${path}/${this.name}`
        }
        return this.arn
    }
    async load() {

    }
}
