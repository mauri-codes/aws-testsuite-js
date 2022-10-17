import { Resource } from "../resources"

export interface ValueComparison {
    expected: string
    found: string
}
export interface TestResult {
    testCode?: string
    success: boolean
    message?: string
    results?: any
    errorCode?: string
}

export interface AttributeTestConfig {
    includeOnly?: string[]
    excludeOnly?: string[]
    throwError?: boolean
}

export type ResourcesCollection = {[key: string]: Resource}
