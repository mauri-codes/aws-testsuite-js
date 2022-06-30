import { DescribeInstancesCommand, Instance } from "@aws-sdk/client-ec2";
import { AWSEnvironment, EC2Resource } from "..";
import { TestError } from "../../errors";
import { MultipleNamedInstancesFound, NamedInstanceNotFound } from "../../errors/EC2";
import { CatchTestError, SuccessfulLoad } from "../../tests";
import { RoleExpectations } from "../../types/EC2";
import { TestResult } from "../../types/tests";

export class EC2Instance extends EC2Resource {
    resourceName: string = EC2Instance.name
    instanceName: string
    instanceData: Instance | undefined
    roleExpectations: RoleExpectations
    constructor(environment: AWSEnvironment, instanceName: string, expectations:RoleExpectations) {
        super(environment)
        this.instanceName = instanceName
        this.roleExpectations = expectations
    }
    async describeInstance() {
        const {Reservations} = await this.client.send(new DescribeInstancesCommand({
            Filters: [
                {
                    Name: "tag:Name", 
                    Values: [this.instanceName]
                }
            ]
        }))
        if (Reservations === undefined || Reservations.length === 0) throw new TestError(NamedInstanceNotFound(this.instanceName))
        if (Reservations.length > 1) throw new TestError(MultipleNamedInstancesFound(this.instanceName))
        const {Instances} = Reservations[0]
        if (Instances === undefined || Instances.length === 0) throw new TestError(NamedInstanceNotFound(this.instanceName))
        if (Instances.length > 1) throw new TestError(MultipleNamedInstancesFound(this.instanceName))
        this.instanceData = Instances[0]
        
        return this.instanceData
    }
    @CatchTestError()
    async loadResource(): Promise<TestResult> {
        await this.describeInstance()
        return SuccessfulLoad(this.resourceName)
    }
}
