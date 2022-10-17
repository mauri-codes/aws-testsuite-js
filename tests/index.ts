import {
    AttributeMismatch,
    NoAttributeFound,
    ResourceDidNotLoad,
    ResourceLoadError,
    TestError
} from "../errors";
import { Resource } from "../resources";
import { AttributeTestConfig, ResourcesCollection, TestResult } from "../types/tests";

export abstract class Test {
    resource: any
    resourceName: string = "resource"
    abstract run(): Promise<TestResult>
    checkLoadOutput(): TestResult {
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

export abstract class Test2<ResourceList> {
    resources: ResourceList
    abstract run(): Promise<TestResult>
    checkLoadOutput(): TestResult {
        let resources = this.resources as unknown as ResourcesCollection
        let resourcesArray = Object.values(resources)
        resourcesArray.forEach(resource => {
            if (resource.loadOutput === undefined) {
                throw new TestError(ResourceDidNotLoad())
            }
            if (!resource.loadOutput.success) {
                throw new TestError(ResourceLoadError(resource))
            }
        })
        return {
            success: true,
            message: "Success"
        }
    }
    constructor(resources: ResourceList) {
        this.resources = resources
    }
    compareAttributesTest (resource: Resource, attributes: any, expectations: any, config?: AttributeTestConfig) {
        let expectationsKeys = Object.keys(expectations)
        if (config) {
            if (config.includeOnly)
                expectationsKeys = config.includeOnly
            else if (config.excludeOnly)
                expectationsKeys = expectationsKeys.filter(key => !config.excludeOnly?.includes(key))
        }
        let response: TestResult = {
            success: true,
            message: "All attributes match"
        }
        let error
        for (const key of expectationsKeys) {
            if (attributes[key] == null) {
                error = NoAttributeFound(key, `${resource.resourceName} resource`)
                break
            }
            if ( !(attributes[key] == expectations[key]) ) {
                error = AttributeMismatch(resource.resourceName, key, expectations[key], attributes[key])
                break
            }
        }
        if (error != undefined) {
            if (config?.throwError === undefined || config.throwError) throw new TestError(error)
            response.message = error.message
            response.success = false
        }
        return response
    }
    compareAttributesArrayTest(resource: Resource, attributesArray:any[], expectations: any) {
        return attributesArray.find(
            element =>
                this.compareAttributesTest(
                    resource,
                    element,
                    expectations,
                    {throwError: false}
                ).success)
    }
}

interface AttributeEqualityParameters {
    resource: any
    resourceDataObject: any
    expectations: any
    attributes: string[]
}
export class AttributeEquality extends Test {
    expectations: any
    attributes: string[]
    resourceDataObject: any
    constructor(testParameters: AttributeEqualityParameters) {
        super()
        this.resource = testParameters.resource
        this.expectations = testParameters.expectations
        this.attributes = testParameters.attributes
        this.resourceDataObject = testParameters.resourceDataObject
    }
    @CatchTestError()
    async run(): Promise<TestResult> {
        this.checkLoadOutput()
        
        this.attributes.forEach(attribute => {
            let expected = this.expectations[attribute]
            let found = this.resourceDataObject[attribute]
            
            if (found === undefined) throw new TestError(NoAttributeFound(attribute, `${this.resourceName} object`))
            if (expected === undefined) throw new TestError(NoAttributeFound(attribute, `${this.resourceName} expectations`))
            if (expected !== "*" && expected !== found) throw new TestError(AttributeMismatch("resource", attribute, expected, found))
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
                    errorCode: error.code || error.Code || error?.info?.errorCode
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
