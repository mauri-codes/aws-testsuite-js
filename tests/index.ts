import { AttributeMismatch, NoAttributeFound, TestError } from "../errors";
import { TestResult } from "../types/tests";

export abstract class Test {
    abstract run(): Promise<TestResult>
}
interface AttributeEqualityParameters {
    resource: any,
    expectations: any,
    attributes: string[]
}
export class AttributeEquality extends Test {
    resource: any
    expectations: any
    attributes: string[]
    constructor(testAttributes: AttributeEqualityParameters) {
        super()
        this.resource = testAttributes.resource
        this.expectations = testAttributes.expectations
        this.attributes = testAttributes.attributes
    }
    @CatchTestError()
    async run() {
        this.attributes.forEach(attribute => {
            let expected = this.expectations[attribute]
            let found = this.resource[attribute]
            if (found === undefined) throw new TestError(NoAttributeFound(attribute, "resource object"))
            if (expected === undefined) throw new TestError(NoAttributeFound(attribute, "expectations object"))
            if (expected !== found) throw new TestError(AttributeMismatch(attribute, expected, found))
        });
        let response: TestResult = {
            success: true,
            message: "All attributes match"
        }
        return response
    }
}
export function CatchTestError() {
    return function(target: any, key: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value
 
        descriptor.value = async function(...args: any[]): Promise<TestResult> {
            try {
                return await originalMethod.apply(this, args)
            } catch (error: any) {
                console.log(error);
                
                const response: TestResult = {
                    success: false,
                    message: error.message,
                    errorCode: error.code || error.Code || error["$metadata"].httpStatusCode
                }
                return response
            }
        }
        return descriptor
    }
}

export const SuccessfulLoad: (resource:string) => TestResult =
    (resource) => ({
        success: true,
        message: `${resource} loaded successfully`
    })
