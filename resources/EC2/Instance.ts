import { DescribeInstancesCommand, Instance } from "@aws-sdk/client-ec2";
import { AWSEnvironment, EC2Resource } from "..";
import { TestError } from "../../errors";
import { InstanceNotFound, MultipleNamedInstancesFound } from "../../errors/EC2";
import { CatchTestError, SuccessfulLoad } from "../../tests";
import { EC2InstanceExpectations, EC2InstanceIdentifier } from "../../types/EC2/Instance";
import { TestResult } from "../../types/tests";

export class EC2Instance extends EC2Resource {
    resourceName: string = EC2Instance.name
    instanceData: Instance | undefined
    identifier: EC2InstanceIdentifier
    instanceExpectations: EC2InstanceExpectations
    instanceSummary: string
    constructor(
        environment: AWSEnvironment,
        identifier: EC2InstanceIdentifier,
        expectations: EC2InstanceExpectations
    ) {
        super(environment)
        this.instanceExpectations = expectations
        this.identifier = identifier
        this.instanceSummary = this.getIdentifierSummary().toString()
    }
    getFilters() {
        let vpcId, name, tags
        let filters = []
        let {instanceId, search} = this.identifier
        if (search){
            ;({ vpcId, name, tags } = search)
        }
        if (instanceId) {
            filters.push(this.getSimpleFilter("instance-id", [instanceId]))
        } else {
            if (vpcId) {
                filters.push(this.getSimpleFilter("instance-id", [vpcId]))
            }
            if (name) {
                filters.push(this.getSimpleFilter("tag:Name", [name]))   
            }
            if (tags) {
                tags.forEach((tag) => {
                    filters.push(this.getSimpleFilter(`tag:${tag.Name}`, [tag.Value]))
                })
            }
        }
        return filters
    }
    getIdentifierSummary () {
        let vpcId, name, tags
        let { instanceId, search } = this.identifier
        if (search) {
            ;({ vpcId, name, tags } = search)
        }
        let summary = [ instanceId, vpcId, name, tags ]
        return summary.filter(element => element != null)
    }
    async describeInstance() {
        let Filters = this.getFilters()
        const {Reservations} = await this.client.send(
            new DescribeInstancesCommand({Filters})
        )
        if (Reservations === undefined || Reservations.length === 0)
            throw new TestError(InstanceNotFound(this.instanceSummary))
        if (Reservations.length > 1)
            throw new TestError(MultipleNamedInstancesFound(this.instanceSummary))
        const {Instances} = Reservations[0]
        if (Instances === undefined || Instances.length === 0)
            throw new TestError(InstanceNotFound(this.instanceSummary))
        if (Instances.length > 1)
            throw new TestError(MultipleNamedInstancesFound(this.instanceSummary))
        this.instanceData = Instances[0]
        
        return this.instanceData
    }
    @CatchTestError()
    async loadResource(): Promise<TestResult> {
        await this.describeInstance()
        console.log(this.instanceData);
        return SuccessfulLoad(this.resourceName)
    }
}
