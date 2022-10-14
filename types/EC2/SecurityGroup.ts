export interface SecurityGroupRule {
    IpProtocol?: string
    FromPort?: string
    ToPort?: string
    CidrIpv4?: string
    CidrIpv6?: string
    PrefixListId?: string
    Description?: string
}
export interface SecurityGroupIdentifier {
    vpcId?: string
    name: string
}
export interface SecurityGroupExpectations {
    SecurityGroupData?: {
        Description?: string
        GroupName?: string
        VpcId?: string
    }
    InboundRules?: SecurityGroupRule[]
    OutboundRules?: SecurityGroupRule[]
}
