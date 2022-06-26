import { AttributeEquality } from ".";
import { Role } from "../resources/IAM/Role";

export class RoleDataPropertiesTest extends AttributeEquality {
    defaultAttributes: string[] = [
        "Path"
    ]
    constructor(role: Role, attributes?: string[]) {
        super({
            resource: role,
            resourceDataObject: role.roleData,
            expectations: role.roleExpectations?.RoleData,
            attributes: attributes || []
        })
        
        this.resourceName = Role.name
        if(this.attributes.length === 0) this.attributes = this.defaultAttributes
    }
}
