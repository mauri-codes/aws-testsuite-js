import { Tag } from "@aws-sdk/client-iam"

export interface PolicyIdentifier {
    policyArn?: string
    policyName?: string
}

export interface RoleExpectation {
    RoleData?: {
        Path?: string
        RoleId?: string
        Arn?: string
        CreateDate?: string
        Description?: string
        ServicePrincipal?: string
        MaxSessionDuration?: string
        Tags?: Tag
    }
    InlinePolicies?: string[]
    ManagedPolicies?: string[]
}
