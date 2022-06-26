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