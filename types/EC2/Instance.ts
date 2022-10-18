import { Tag } from ".."

export interface EC2InstanceExpectations {
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
    }[]
}

export interface EC2InstanceIdentifier {
    instanceId?: string
    search?: {
        vpcId?: string
        name?: string
        tags?: Tag[]
    }
}
