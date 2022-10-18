import { CatchTestError, Test2 } from ".."
import { EC2Instance } from "../../resources/EC2/Instance"
import { TestResult } from "../../types/tests"

export class EC2InstancePropertiesTest extends Test2<{ec2Instance: EC2Instance}> {

    constructor(ec2Instance: EC2Instance) {
        super({ec2Instance})
    }
    @CatchTestError()
    async run(): Promise<TestResult> {
        let resource = this.resources.ec2Instance
        this.compareAttributesTest(
            resource,
            resource.instanceData,
            resource.instanceExpectations.EC2Data
        )
        return {
            success: true,
            message: `All attributes for ${resource.resourceName} match`
        }
    }
}
