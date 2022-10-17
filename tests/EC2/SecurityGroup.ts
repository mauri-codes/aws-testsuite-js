import { CatchTestError, Test2 } from "..";
import { TestError } from "../../errors";
import { NoInboundSecurityGroupRuleFound, NoOutboundSecurityGroupRuleFound } from "../../errors/EC2/SecurityGroup";
import { Resource } from "../../resources";
import { SecurityGroup } from "../../resources/EC2/SecurityGroup";
import { TestResult } from "../../types/tests";

export class SecurityGroupPropertiesTest extends Test2<{securityGroup: SecurityGroup}> {
    constructor(securityGroup: SecurityGroup) {
        super({ securityGroup })
    }
    @CatchTestError()
    async run(): Promise<TestResult> {
        let resource = this.resources.securityGroup
        this.compareAttributesTest(
            resource,
            resource.sgBaseData,
            resource.sgExpectations.SecurityGroupData
        )
        let outbound = this.resources.securityGroup.sgRules?.filter(rule => rule.IsEgress)
        let inbound = this.resources.securityGroup.sgRules?.filter(rule => !rule.IsEgress)
        let outboundExp = resource.sgExpectations.OutboundRules || []
        let inboundExp = resource.sgExpectations.InboundRules || []
        inboundExp.forEach(expectation => {
            let valueFound = this.compareAttributesArrayTest(resource, inbound || [], expectation)
            if (valueFound === undefined) {
                let ruleValues = Object.values(expectation)
                throw new TestError(NoInboundSecurityGroupRuleFound(ruleValues.toString()))
            }
        })
        outboundExp.forEach(expectation => {
            let valueFound = this.compareAttributesArrayTest(resource, outbound || [], expectation)
            if (valueFound === undefined) {
                let ruleValues = Object.values(expectation)
                throw new TestError(NoOutboundSecurityGroupRuleFound(ruleValues.toString()))
            }
        })
        return {
            success: true,
            message: `All attributes for ${this.resources.securityGroup.resourceName} match`
        }
    }
}
