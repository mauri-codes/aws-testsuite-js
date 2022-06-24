import { Tag } from "@aws-sdk/client-iam"
import { ManagedPolicy } from "../resources/IAM/Policy"

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
    ManagedPolicies?: ManagedPolicy[]
}

export interface ManagedPolicyExpectation {
    PolicyData?: {
        PolicyId?: string
        Path?: string
        DefaultVersionId?: string
        AttachmentCount?: number
        Description?: string
    }
    PolicyDocumentStatements?: {
        Id: string
        Effect: "Allow" | "Deny"
        Action: string | string[]
        Resource: string | string[]
    }[]
    PolicyDocumentEvaluation?: {
        Effect: "Allow" | "Deny"
        Action: string | string[]
        Resource: string | string[]        
    }[]
}
