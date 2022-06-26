import { AWSEnvironment, IAMResource } from "..";
import { RoleExpectation } from "../../types/IAM";
import {
    GetRoleCommand,
    AttachedPolicy,
    Role as RoleData,
    ListRolePoliciesCommand,
    ListAttachedRolePoliciesCommand
} from "@aws-sdk/client-iam";
import { ManagedPolicy } from "./Policy";
import { CatchTestError, SuccessfulLoad } from "../../tests";

export class Role extends IAMResource {
    resourceName: string = Role.name
    roleName: string
    roleExpectations: RoleExpectation | undefined
    roleData: RoleData | undefined
    managedPoliciesList: AttachedPolicy[] | undefined
    managedPolicies: ManagedPolicy[] | undefined
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
        
        return this.roleData
    }
    async getManagedPoliciesList() {
        const params = {RoleName: this.roleName}
        const requestOutput = await this.client.send(new ListAttachedRolePoliciesCommand(params))
        this.managedPoliciesList = requestOutput.AttachedPolicies
        return this.managedPoliciesList
    }
    async getManagedPolicies() {
        if(this.roleExpectations?.ManagedPolicies) {
            const policiesRequests = this.roleExpectations.ManagedPolicies.map((policy) => policy.load())
            await Promise.all(policiesRequests)
            this.managedPolicies = this.roleExpectations.ManagedPolicies
        }
    }
    async getInlinePolicies() {
        const params = {RoleName: this.roleName}
        const requestOutput = await this.client.send(new ListRolePoliciesCommand(params))
        this.inlinePolicies = requestOutput.PolicyNames
        return this.inlinePolicies
    } 
    @CatchTestError()
    async loadResource () {
        let requests: Promise<any>[] = []
        if (this.roleExpectations?.RoleData) {
            requests.push(this.getRoledData())
        }
        if (this.roleExpectations?.InlinePolicies) {
            requests.push(this.getInlinePolicies())
        }
        if (this.roleExpectations?.ManagedPolicies) {
            requests.push(this.getManagedPoliciesList())
            requests.push(this.getManagedPolicies())
        }
        await Promise.all(requests)
        return SuccessfulLoad(this.resourceName)
    }
}
