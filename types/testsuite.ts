import { TestResult } from "./tests";

export interface TestSuiteReport {
    testSuiteCode: string
    tests: TestResult[]
}
