import { AttributeMismatch, NoAttributeFound, ResourceDidNotLoad, TestError } from "../errors";
import { TestResult } from "../types/tests";

export abstract class Test {
    resource: any
    async run(): Promise<TestResult> {
        if (this.resource.loadOutput === undefined) {
            throw new TestError(ResourceDidNotLoad())
        }
        if (!this.resource.loadOutput.success) {
            throw new TestError(this.resource.loadOutput)
        }
        return {
            success: true,
            message: "Success"
        }
    }
}
interface AttributeEqualityParameters {
    resource: any,
    resourceDataObject: any,
    expectations: any,
    attributes: string[]
}
export class AttributeEquality extends Test {
    resourceName: string = "resource"
    expectations: any
    attributes: string[]
    resourceDataObject: any
    constructor(testAttributes: AttributeEqualityParameters) {
        super()
        this.resource = testAttributes.resource
        this.expectations = testAttributes.expectations
        this.attributes = testAttributes.attributes
        this.resourceDataObject = testAttributes.resourceDataObject
    }
    @CatchTestError()
    async run(): Promise<TestResult> {
        super.run()
        
        this.attributes.forEach(attribute => {
            let expected = this.expectations[attribute]
            let found = this.resourceDataObject[attribute]
            
            if (found === undefined) throw new TestError(NoAttributeFound(attribute, `${this.resourceName} object`))
            if (expected === undefined) throw new TestError(NoAttributeFound(attribute, `${this.resourceName} expectations`))
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
                
                const response: TestResult = {
                    success: false,
                    message: error.message,
                    errorCode: error.code || error.Code
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
