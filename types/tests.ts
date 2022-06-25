export interface ValueComparison {
    expected: string
    found: string
}
export interface TestResult {
    success: boolean
    message?: string
    results?: any
    errorCode?: string
}