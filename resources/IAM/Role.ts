import { AWSEnvironment, IAMResource } from "..";
import { RoleExpectation } from "../../types/IAM";
import {
    IAMClient,
    GetRoleCommand,
    AttachedPolicy,
    Role as RoleData,
    ListRolePoliciesCommand,
    ListAttachedRolePoliciesCommand
} from "@aws-sdk/client-iam";

export class Role extends IAMResource {
    roleName: string
    roleExpectations: RoleExpectation | undefined
    roleData: RoleData | undefined
    managedPolicies: AttachedPolicy[] | undefined
    inlinePolicies: string[] | undefined
    constructor(environment: AWSEnvironment, roleName:string, expectations?: RoleExpectation) {
        super(environment)
        this.roleExpectations = expectations
        this.roleName = roleName
    }
    async getRoledData() {
        const params = {RoleName: this.roleName}
        const requestOutput = await this.client.send(new GetRoleCommand(params))
        this.roleData = requestOutput.Role
        console.log(this.roleData);
        
        return this.roleData
    }
    async getManagedPolicies() {
        const params = {RoleName: this.roleName}
        const requestOutput = await this.client.send(new ListAttachedRolePoliciesCommand(params))
        this.managedPolicies = requestOutput.AttachedPolicies
        return this.managedPolicies
    }
    async getInlinePolicies() {
        const params = {RoleName: this.roleName}
        const requestOutput = await this.client.send(new ListRolePoliciesCommand(params))
        this.inlinePolicies = requestOutput.PolicyNames
        return this.inlinePolicies
    } 
    async load() {
        let requests = []
        if (this.roleExpectations?.RoleData) {
            requests.push(this.getRoledData())
        }
        if (this.roleExpectations?.InlinePolicies) {
            requests.push(this.getInlinePolicies())
        }
        if (this.roleExpectations?.ManagedPolicies) {
            requests.push(this.getManagedPolicies())
        }
        const [first, second, third] = await Promise.all(requests)
        console.log(first);
        console.log(second);
        console.log(third);
    }
}
