import { AWSEnvironment, Resource } from "..";
import { RoleDescription } from "../../types/IAM";
import {
    IAMClient,
    GetRoleCommand,
    Role as RoleData,
    ListAttachedRolePoliciesCommand
} from "@aws-sdk/client-iam";

export class Role extends Resource {
    client: IAMClient
    roleName: string
    roleDescription: RoleDescription = {}
    roleData: RoleData | undefined
    constructor(environment: AWSEnvironment, roleName:string) {
        super()
        this.client = environment.getAWSClient("iam")
        this.roleName = roleName
    }
    async getRole() {
        const params = {RoleName: this.roleName}
        const requestOutput = await this.client.send(new GetRoleCommand(params))
        this.roleData = requestOutput.Role
        console.log(this.roleData)
    }
    async getManagedPolicies() {
        const params = {RoleName: this.roleName}
        const requestOutput = await this.client.send(new ListAttachedRolePoliciesCommand(params))
        console.log(requestOutput.AttachedPolicies)
    }
    load() {

    }
}
