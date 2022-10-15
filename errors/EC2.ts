import { ErrorDescription } from ".";
export const NamedInstanceNotFound: (instanceName: string) => ErrorDescription =
    (instanceName) => ({
        code: NamedInstanceNotFound.name,
        message: `No instance named ${instanceName} found`
    }
)
export const MultipleNamedInstancesFound: (instanceName: string) => ErrorDescription =
    (instanceName) => ({
        code: MultipleNamedInstancesFound.name,
        message: `Multiple Instances named ${instanceName} found`
    }
)
