import { AttributeEquality, CatchTestError, Test } from ".";
import { TestError } from "../errors";
import { PolicyStatementNotFound } from "../errors/IAM";
import { ManagedPolicy } from "../resources/IAM/Policy";
import { Role } from "../resources/IAM/Role";
import { AWSPolicyDocument, PolicyStatement } from "../types/IAM";
import { TestResult } from "../types/tests";

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

interface CheckPolicyStatementsParameters {
    resource: any
    policyDocument: string
    statements: PolicyStatement[]
}
export class CheckPolicyStatements extends Test {
    policyDocumentEncoded: string
    policyDocument: AWSPolicyDocument | undefined
    expectationStatements: PolicyStatement[]
    constructor(testParameters: CheckPolicyStatementsParameters) {
        super()
        this.resource = testParameters.resource
        this.policyDocumentEncoded = testParameters.policyDocument
        this.expectationStatements = testParameters.statements
    }
    compareStatements(statement: PolicyStatement) {
        return this.policyDocument?.Statement.find(docStatement => {
            if (statement.Sid && statement.Sid !== docStatement.Sid) return false
            if (statement.Effect !== docStatement.Effect) return false
            if (!this.compareListOfStrings(docStatement.Effect, statement.Effect)) return false
            if (!this.compareListOfStrings(docStatement.Action, statement.Action)) return false
            return true
        })
    }
    compareListOfStrings(list: string | string[], expectationList: string | string[]): boolean {
        if (typeof list === "string" && typeof expectationList === "string") {
            return list === expectationList
        }
        if (typeof list === "string" && expectationList !== "string") {
            return expectationList.length === 1 && (expectationList as string[]).pop() === list
        }
        if (typeof list !== "string" && expectationList === "string") {
            return list.find(str => expectationList === str) !== undefined
        }
        (expectationList as string[]).forEach(expectation => {
            if ((list as string[]).find(str => str === expectation) === undefined) return false
        });
        return true
    }
    @CatchTestError()
    async run(): Promise<TestResult> {
        this.checkLoadOutput()
        this.policyDocument = JSON.parse(decodeURIComponent(this.policyDocumentEncoded))
        this.expectationStatements.forEach(statement => {
            if (!this.compareStatements(statement)) throw new TestError(PolicyStatementNotFound(this.resourceName, statement))
        });
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
