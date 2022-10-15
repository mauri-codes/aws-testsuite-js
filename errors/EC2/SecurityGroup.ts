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
