import { ErrorDescription } from ".";
import { PolicyStatement } from "../types/IAM";

export const PolicyStatementNotFound: (policy: string, policyStatement: PolicyStatement) => ErrorDescription =
    (policy, policyStatement) => ({
        code: PolicyStatementNotFound.name,
        message: `${policy} does not contain statement ${JSON.stringify(policyStatement)}`
    })
export const PolicyEvaluationFailed: (policy: string, expectedAction: string) => ErrorDescription =
    (policy, expectedAction) => ({
        code: PolicyEvaluationFailed.name,
        message: `${expectedAction} fails when running against ${policy}`
    })
export const PolicyEvaluationSuccededError: (policy: string, expectedAction: string) => ErrorDescription =
    (policy, expectedAction) => ({
        code: PolicyEvaluationSuccededError.name,
        message: `${expectedAction} on succeded when running against ${policy}. It was expected to fail`
    })
