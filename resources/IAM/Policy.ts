import { AWSEnvironment, IAMResource } from "..";
import {
    Policy,
    PolicyVersion,
    GetPolicyCommand,
    GetPolicyVersionCommand
} from "@aws-sdk/client-iam";
import { ManagedPolicyExpectation, PolicyIdentifier } from "../../types/IAM";

export class ManagedPolicy extends IAMResource {
    arn: string | undefined
    name: string | undefined
    policyData: Policy | undefined
    policyDocument: PolicyVersion | undefined
    policyExpectations: ManagedPolicyExpectation | undefined
    constructor(
        environment: AWSEnvironment,
        identifier: PolicyIdentifier,
        expectations?: ManagedPolicyExpectation
    ) {
        super(environment)
        const {policyArn, policyName} = identifier
        this.policyExpectations = expectations
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
        console.log("--1--");
        
        console.log(requestOutput.PolicyVersion);
        
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
        await this.getArn()
        console.log("----------S----------");
        
        const makeDocRequest = this.policyExpectations?.PolicyDocumentEvaluation || this.policyExpectations?.PolicyDocumentStatements
        if (this.policyExpectations?.PolicyData || makeDocRequest) {
            const policyData = await this.getPolicy()
            if ( makeDocRequest ) {
                await this.getPolicyDocument(policyData?.DefaultVersionId || "v1")
            }
        }
    }
}
