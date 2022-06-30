import { AttributeEquality, CatchTestError, Test } from ".";
import { TestError } from "../errors";
import { PolicyEvaluationFailed, PolicyEvaluationSuccededError, PolicyStatementNotFound } from "../errors/IAM";
import { ManagedPolicy } from "../resources/IAM/Policy";
import { Role } from "../resources/IAM/Role";
import { AWSPolicyDocument, OnlyArrayPolicyStatment, PolicyStatement } from "../types/IAM";
import { TestResult } from "../types/tests";
import {
    SimulateCustomPolicyCommand,
    SimulateCustomPolicyCommandInput,
    IAMClient
} from "@aws-sdk/client-iam";

export class RoleDataPropertiesTest extends AttributeEquality {
    defaultAttributes: string[] = [
        "Path"
    ]
    constructor(role: Role, attributes?: string[]) {
        super({
            resource: role,
            resourceDataObject: role.roleData,
            expectations: role.roleExpectations?.RoleData,
            attributes: attributes || []
        })
        
        this.resourceName = Role.name
        if(this.attributes.length === 0) this.attributes = this.defaultAttributes
    }
}

export abstract class PolicyStatementsTest extends Test {
    policyDocumentEncoded: string
    policyDocument: AWSPolicyDocument | undefined
    onlyArrayPolicyStatement: OnlyArrayPolicyStatment[] | undefined
    expectationStatements: PolicyStatement[]
    onlyArrayExpectationStatements: OnlyArrayPolicyStatment[] | undefined
    constructor({resource, policyDocument, statements}: PolicyStatementsTestParameters) {
        super()
        this.resource = resource
        this.policyDocumentEncoded = policyDocument
        this.expectationStatements = statements
    }
    preProcessStatements() {
        this.onlyArrayExpectationStatements = this.expectationStatements.map(statement => ({
            ...statement,
            Action: this.returnArray(statement.Action),
            Resource: this.returnArray(statement.Resource)
        }))
        this.policyDocument = JSON.parse(decodeURIComponent(this.policyDocumentEncoded))
        this.onlyArrayPolicyStatement = (this.policyDocument?.Statement || []).map(statement =>({
            ...statement,
            Action: this.returnArray(statement.Action),
            Resource: this.returnArray(statement.Resource)
        }))
    }
    returnArray(strOrArray: string | string[]): string[] {
        if (typeof strOrArray === "string") strOrArray = [strOrArray]
        return strOrArray
    }
}

interface PolicyStatementsTestParameters {
    resource: any
    policyDocument: string
    statements: PolicyStatement[]
}
export class CheckPolicyStatements extends PolicyStatementsTest {

    constructor(testParameters: PolicyStatementsTestParameters) {
        super(testParameters)        
    }
    compareStatements(statement: OnlyArrayPolicyStatment) {
        return (this.onlyArrayPolicyStatement || []).find(docStatement => {
            if (statement.Sid && statement.Sid !== docStatement.Sid) return false
            if (statement.Effect !== docStatement.Effect) return false
            if (!this.compareListOfStrings(docStatement.Resource, statement.Resource)) return false
            if (!this.compareListOfStrings(docStatement.Action, statement.Action)) return false
            return true
        })
    }
    compareListOfStrings(list: string[], expectationList: string[]): boolean {
        let found = true
        expectationList.forEach(expectation => {
            if (list.find(str => str === expectation) === undefined) found = false
        });
        return found
    }
    @CatchTestError()
    async run(): Promise<TestResult> {
        this.checkLoadOutput()
        this.preProcessStatements()
        this.policyDocument = JSON.parse(decodeURIComponent(this.policyDocumentEncoded))
        ;(this.onlyArrayExpectationStatements || []).forEach(statement => {
            if (!this.compareStatements(statement)) throw new TestError(PolicyStatementNotFound(this.resourceName, statement))
        })
        return {
            success: true,
            message: "All statements are present in the policy document"
        }
    }
}

export class CheckManagedPolicyStatements extends CheckPolicyStatements {
    constructor(policy: ManagedPolicy) {
        super({
            policyDocument: policy.policyDocument?.Document || "",
            resource: policy,
            statements: policy.policyExpectations?.PolicyDocumentStatements || []
        })
        this.resourceName = policy.name || ManagedPolicy.name
    }
}

export class EvaluatePolicyDocument extends PolicyStatementsTest {
    constructor(testParameters: PolicyStatementsTestParameters) {
        super(testParameters)
    }
    @CatchTestError()
    async run(): Promise<TestResult> {
        this.checkLoadOutput()
        this.preProcessStatements()
        const iamClient: IAMClient = this.resource.environment.getAWSClient("iam")

        const requests = (this.onlyArrayExpectationStatements ||[]).map(({Action, Resource, Effect}) => {
            let params: SimulateCustomPolicyCommandInput = {
                ActionNames: Action as string[],
                PolicyInputList: [decodeURIComponent(JSON.stringify(this.policyDocument))],
                ResourceArns: Resource as string[]
            }
            
            return iamClient.send(new SimulateCustomPolicyCommand(params))
        })
        const requestResponses = await Promise.all(requests)
        const mappedResponses = requestResponses.map(({EvaluationResults}) => {
            let mappedEvaluation:{[key: string]: string} = {}
            EvaluationResults?.forEach(({EvalActionName, EvalDecision}) => {
                mappedEvaluation[EvalActionName || ""] = EvalDecision || ""
            })
            return mappedEvaluation
        })
        ;(this.onlyArrayExpectationStatements || []).forEach(({Action, Effect}, index) => {
            let evaluationObj = mappedResponses[index]
            ;(Action as string[]).forEach((action) => {
                if (evaluationObj[action] === "allowed" && Effect === "Deny") throw new TestError(PolicyEvaluationSuccededError(this.resourceName, action))
                if (evaluationObj[action] !== "allowed" && Effect === "Allow") throw new TestError(PolicyEvaluationFailed(this.resourceName, action))
            })
            
        })
        return {
            success: true,
            message: "All statements pass the evaluation"
        }
    }
}
