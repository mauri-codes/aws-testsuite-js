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
import { TestError } from "../../errors";
import { MultipleSecurityGroupsFound, NoSecurityGroupFound } from "../../errors/EC2/SecurityGroup";

export class SecurityGroup extends EC2Resource {
    resourceName: string = SecurityGroup.name
    sgId: string | undefined
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

    getGroupIdFilter(groupId?: string) {
        if (groupId) {
            this.sgId = groupId
        }
        return this.getSimpleFilter("group-id", [this.sgId || ""])
    }

    getSimpleFilter(Name:string, Values: string[]) {
        return {Name, Values}
    }

    getIdentifierSummary () {
        let vpcId, name, tags
        let { securityGroupId, search } = this.sgIdentifier
        if (search) {
            ({ vpcId, name, tags } = search)
        }
        let summary = [ securityGroupId, vpcId, name, tags ]
        return summary.filter(element => element != null)
    }

    async describeSecurityGroup() {
        let Filters = []
        if (this.sgIdentifier.securityGroupId) {
            Filters.push(this.getGroupIdFilter(this.sgIdentifier.securityGroupId))
        } else {
            if (this.sgIdentifier?.search?.vpcId) {
                Filters.push(this.getSimpleFilter("vpc-id", [this.sgIdentifier.search.vpcId]))
            }
            if (this.sgIdentifier?.search?.name) {
                Filters.push(this.getSimpleFilter("group-name", [this.sgIdentifier.search.name]))
            }
            let tags = this.sgIdentifier?.search?.tags
            if (tags) {
                tags.forEach((tag) => {
                    Filters.push(this.getSimpleFilter(`tag:${tag.Name}`, [tag.Value]))
                })
            }
        }
        const params:DescribeSecurityGroupsCommandInput = { Filters }
        const request = await this.client.send(new DescribeSecurityGroupsCommand(params))

        this.sgFound = request.SecurityGroups?.length
        if (request.SecurityGroups?.length === 1) {
            this.sgBaseData = request.SecurityGroups.pop()
            this.sgId = this.sgBaseData?.GroupId
        } else {
            if (this.sgFound === 0) throw new TestError(NoSecurityGroupFound(this.getIdentifierSummary().toString()))
            else throw new TestError(MultipleSecurityGroupsFound(this.getIdentifierSummary().toString()))
        }
        return this.sgBaseData
    }
    @CatchTestError()
    async loadResource(): Promise<TestResult> {
        await this.describeSecurityGroup()
        console.log(this.sgBaseData);
        await this.describeSecurityGroupRules()
        console.log(this.sgRules);
        return SuccessfulLoad(this.resourceName)
    }
}
