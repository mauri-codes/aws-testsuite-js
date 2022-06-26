import { AWSEnvironment, Resource } from "../resources";
import { Test } from "../tests";
import { TestSuiteReport } from "../types/testsuite";


export abstract class TestSuite<ResourceObjectType> {
    abstract testSuiteCode: string
    environment: AWSEnvironment
    resources: ResourceObjectType
    resourceList: Resource[] = []
    tests: Test[] = []
    constructor(environment: AWSEnvironment, resources: ResourceObjectType) {
        this.environment = environment
        this.resources = resources
    }
    abstract run(): Promise<TestSuiteReport>
}
