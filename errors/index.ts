
export interface ErrorDescription {
    message: string
    code: string
}
export class TestError extends Error {
    info: ErrorDescription
    code: string
    constructor(error: ErrorDescription) {
       super(error.message)
       this.info = error
       this.code = error.code
    }
}
export const NoAttributeFound: (attribute: string, source: string) => ErrorDescription =
    (attribute, source) => ({
        code: NoAttributeFound.name,
        message: `No attribute ${attribute} found in ${source}`
    })

export const AttributeMismatch: (attribute: string, expected: any, found: any) => ErrorDescription =
    (attribute, expected, found) => ({
        code: AttributeMismatch.name,
        message: `Expected attribute ${attribute} to be ${expected}. Found ${found}`
    })
