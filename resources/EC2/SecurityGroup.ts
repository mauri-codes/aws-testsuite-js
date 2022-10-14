import {
    DescribeSecurityGroupsCommand,
    DescribeSecurityGroupsCommandInput,
    SecurityGroup as AWSSecurityGroup,
    DescribeSecurityGroupRulesCommand,
    DescribeSecurityGroupRulesCommandInput,
    SecurityGroupRule as AWSSecurityGroupRule
} from "@aws-sdk/client-ec2";
import { AWSEnvironment, EC2Resource } from "..";
import { CatchTestError, SuccessfulLoad } from "../../tests";
import { TestResult } from "../../types/tests";
import {
    SecurityGroupExpectations,
    SecurityGroupIdentifier
} from "../../types/EC2/SecurityGroup";

export class SecurityGroup extends EC2Resource {
    resourceName: string = SecurityGroup.name
    sgIdentifier: SecurityGroupIdentifier
    sgBaseData: AWSSecurityGroup | undefined
    sgFound: number | undefined
    sgRules: AWSSecurityGroupRule[] | undefined
    sgExpectations: SecurityGroupExpectations
    constructor(
            environment: AWSEnvironment,
            identifier: SecurityGroupIdentifier,
            sgExpectations: SecurityGroupExpectations
        ) {
        super(environment)
        this.sgIdentifier = identifier
        this.sgExpectations = sgExpectations
    }

    async describeSecurityGroupRules () {
        const params: DescribeSecurityGroupRulesCommandInput = {
            Filters: [{
                Name: "group-id",
                Values: [this.sgBaseData?.GroupId || ""]
            }]
        }
        const request = await this.client.send(new DescribeSecurityGroupRulesCommand(params))
        this.sgRules = request.SecurityGroupRules
        return this.sgRules
    }

    async describeSecurityGroup() {
        let vpcData = {}
        if (this.sgIdentifier.vpcId != null) {
            vpcData = {
                Name: "vpc-id",
                Values: [
                    this.sgIdentifier.vpcId || ""
                ]
            }
        }
        const params:DescribeSecurityGroupsCommandInput = {
            Filters: [
                {
                    ...vpcData
                },
                {
                    Name: "group-name",
                    Values: [
                        this.sgIdentifier.name
                    ]
                }
            ]
        }
        const request = await this.client.send(new DescribeSecurityGroupsCommand(params))
        this.sgFound = request.SecurityGroups?.length
        if (request.SecurityGroups?.length === 1) {
            this.sgBaseData = request.SecurityGroups.pop()
        }
        return this.sgBaseData
    }
    @CatchTestError()
    async loadResource(): Promise<TestResult> {
        await this.describeSecurityGroup()
        if (this.sgFound === 1) {
            await this.describeSecurityGroupRules()
            console.log(this.sgRules);
        }
        return SuccessfulLoad(this.resourceName)
    }
}
