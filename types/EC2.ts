export interface RoleExpectations {
    EC2Data?: {
        ImageId?: string
        InstanceId?: string
        InstanceType?: string
        KeyName?: string
        PrivateDnsName?: string
        PrivateIpAddress?: string
        PublicDnsName?: string
        PublicIpAddress?: string
        SubnetId?: string
        VpcId?: string
        Architecture?: string
        EbsOptimized?: string
        SourceDestCheck?: string
        RootDeviceName?: string
        RootDeviceType?: string
        Ipv6Address?: string
    }
    SecurityGroups?: {
        GroupName?: string
        GroupId?: string
    }
}