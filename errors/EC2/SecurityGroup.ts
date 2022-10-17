import { ErrorDescription } from "..";
export const NoSecurityGroupFound: (sgValues: string) => ErrorDescription =
    (sgValues) => ({
        code: NoSecurityGroupFound.name,
        message: `No Security Group with values:[${sgValues}] found`
    }
)

export const MultipleSecurityGroupsFound: (sgValues: string) => ErrorDescription =
    (sgValues) => ({
        code: MultipleSecurityGroupsFound.name,
        message: `Multiple Security Groups with values:[${sgValues}] found`
    }
)

export const NoInboundSecurityGroupRuleFound: (ruleValues: string) => ErrorDescription =
    (ruleValues) => ({
        code: NoInboundSecurityGroupRuleFound.name,
        message: `No Inbound Rule Found with values: [${ruleValues}]`
    }
)

export const NoOutboundSecurityGroupRuleFound: (ruleValues: string) => ErrorDescription =
    (ruleValues) => ({
        code: NoOutboundSecurityGroupRuleFound.name,
        message: `No Outbound Rule Found with values: [${ruleValues}]`
    }
)
