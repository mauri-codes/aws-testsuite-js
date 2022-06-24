import { AWSEnvironment, Resource } from "..";
import { RoleExpectation } from "../../types/IAM";
import {
    IAMClient,
    GetRoleCommand,
    AttachedPolicy,
    Role as RoleData,
    ListRolePoliciesCommand,
    ListAttachedRolePoliciesCommand
} from "@aws-sdk/client-iam";

export class Role extends Resource {
    client: IAMClient
    roleName: string
    roleExpectations: RoleExpectation | undefined
    roleData: RoleData | undefined
    managedPolicies: AttachedPolicy[] | undefined
    inlinePolicies: string[] | undefined
    constructor(environment: AWSEnvironment, roleName:string, expectations?: RoleExpectation) {
        super()
        this.roleExpectations = expectations
        this.client = environment.getAWSClient("iam")
        this.roleName = roleName
    }
    async retrieveRole() {
        const params = {RoleName: this.roleName}
        const requestOutput = await this.client.send(new GetRoleCommand(params))
        this.roleData = requestOutput.Role
        console.log(this.roleData);
        
        return this.roleData
    }
    async retrieveManagedPolicies() {
        const params = {RoleName: this.roleName}
        const requestOutput = await this.client.send(new ListAttachedRolePoliciesCommand(params))
        this.managedPolicies = requestOutput.AttachedPolicies
        return this.managedPolicies
    }
    async retrieveInlinePolicies() {
        const params = {RoleName: this.roleName}
        const requestOutput = await this.client.send(new ListRolePoliciesCommand(params))
        this.inlinePolicies = requestOutput.PolicyNames
        return this.inlinePolicies
    } 
    async load() {
        let requests = []
        if (this.roleExpectations?.RoleData) {
            requests.push(this.retrieveRole())
        }
        if (this.roleExpectations?.InlinePolicies) {
            requests.push(this.retrieveInlinePolicies())
        }
        if (this.roleExpectations?.ManagedPolicies) {
            requests.push(this.retrieveManagedPolicies())
        }
        const [first, second, third] = await Promise.all(requests)
        console.log(first);
        console.log(second);
        console.log(third);
    }
}
