import { AttributeEquality, CatchTestError, Test } from ".";
import { TestError } from "../errors";
import { EC2Instance } from "../resources/EC2/Instance";
import { TestResult } from "../types/tests";

export class EC2InstancePropertiesTest extends Test {
    basicAttributesTest: AttributeEquality
    attributes: string[]
    defaultAttributes: string[] = [
        "KeyName"
    ]
    constructor(ec2Instance: EC2Instance, attributes?: string[]) {
        super()
        this.basicAttributesTest = new AttributeEquality({
            resource: ec2Instance,
            resourceDataObject: ec2Instance.instanceData,
            attributes: attributes || [],
            expectations: ec2Instance.roleExpectations.EC2Data
        })
        this.attributes = attributes || []
        this.resourceName = "EC2Instance"
        if(this.attributes.length === 0) this.attributes = this.defaultAttributes
    }
    @CatchTestError()
    async run(): Promise<TestResult> {
        const basicAttTest = await this.basicAttributesTest.run()
        if (basicAttTest.success == false) {
            throw new TestError({code: basicAttTest.errorCode || "", message: basicAttTest.message || ""})
        }
        return {
            success: true,
            message: `All attributes for ${this.resourceName} match`
        }
    }
}
