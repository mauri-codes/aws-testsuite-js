import { AWSEnvironment, Resource } from "../../resources";
import { ManagedPolicy } from "../../resources/IAM/Policy";
import { Role } from "../../resources/IAM/Role";
import { RoleDataPropertiesTest } from "../../tests/IAM";
import { TestSuite } from "../index";
interface SinglePageAppOnEC2Resources {
    ec2RoleName: string
}
export class SinglePageAppOnEC2 extends TestSuite<SinglePageAppOnEC2Resources> {
    testSuiteCode: string = SinglePageAppOnEC2.name
    constructor(environment: AWSEnvironment, resources: SinglePageAppOnEC2Resources) {
        super(environment, resources)
    }
    async run() {
        const role = new Role(this.environment, this.resources.ec2RoleName, {
            RoleData: {
                Path: "/dd"
            },
            ManagedPolicies: [
                new ManagedPolicy(
                    this.environment,
                    {policyName: "test-managed-policy"},
                    {
                        PolicyData:{
                            Path:"/"
                        },
                        PolicyDocumentEvaluation: [{
                            Action: "",
                            Effect: "Allow",
                            Resource: ""
                        }]
                    }
                ),
                new ManagedPolicy(
                    this.environment,
                    {policyName: "test-managed-policy-2"},
                    {
                        PolicyData:{
                            Path:"/"
                        },
                        PolicyDocumentEvaluation: [{
                            Action: "",
                            Effect: "Allow",
                            Resource: ""
                        }]
                    }
                )
            ]
        })
        this.resourceList = [
            role
        ]
        const resourcesOutput = await Promise.all(this.resourceList.map(resource => resource.load()))
        this.tests = [
            new RoleDataPropertiesTest(role)
        ]
        const testsOutput = await Promise.all(this.tests.map(test => test.run()))


        return {
            testSuiteCode: this.testSuiteCode,
            tests: testsOutput
        }
    }
}
