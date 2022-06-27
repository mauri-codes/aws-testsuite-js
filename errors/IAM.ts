import { ErrorDescription } from ".";
import { PolicyStatement } from "../types/IAM";

export const PolicyStatementNotFound: (policy: string, policyStatement: PolicyStatement) => ErrorDescription =
    (policy, policyStatement) => ({
        code: PolicyStatementNotFound.name,
        message: `${policy} does not contain statement ${JSON.stringify(policyStatement)}`
    })
