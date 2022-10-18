import { ErrorDescription } from ".";
export const InstanceNotFound: (instanceData: string) => ErrorDescription =
    (instanceData) => ({
        code: InstanceNotFound.name,
        message: `No instance with values: [${instanceData}] found`
    }
)
export const MultipleNamedInstancesFound: (instanceData: string) => ErrorDescription =
    (instanceData) => ({
        code: MultipleNamedInstancesFound.name,
        message: `Multiple Instances with values ${instanceData} found`
    }
)
