import { testTemplate, TestTemplateOptions, testTemplateWithQuickPick } from './utils'
import { EOL } from 'os'
import { it, TestFunction } from 'mocha'

type RunTestFn = TestFn & {
  only: TestFn
  skip: TestFn
}

export type Options = Omit<TestTemplateOptions, 'preAssertAction'>
type TestFn = (test: string, options?: Options) => void
type RunTestQuickPickFn = (test: string, trimWhitespaces?: boolean, skipSuggestions?: number, cancelQuickPick?: boolean) => void

export const runTest = __runTest.bind(null, it) as RunTestFn
export const runTestMultiline = __runTestMultiline.bind(null, it) as RunTestFn
export const runTestQuickPick = (test: string, trimWhitespaces?: boolean, skipSuggestions = 0, cancelQuickPick = false) =>
  __runTestQuickPick(it, test, trimWhitespaces, skipSuggestions, cancelQuickPick)
export const runTestMultilineQuickPick = (test: string, trimWhitespaces?: boolean, skipSuggestions = 0, cancelQuickPick = false) =>
  __runTestMultilineQuickPick(it, test, trimWhitespaces, skipSuggestions, cancelQuickPick)

runTest.only = __runTest.bind(null, it.only.bind(it)) as RunTestFn
runTest.skip = __runTest.bind(null, it.skip.bind(it)) as RunTestFn
runTestMultiline.only = __runTestMultiline.bind(null, it.only.bind(it)) as TestFn
runTestMultiline.skip = __runTestMultiline.bind(null, it.skip.bind(it)) as TestFn
runTestQuickPick.only = __runTestQuickPick.bind(null, it.only.bind(it)) as RunTestQuickPickFn
runTestQuickPick.skip = __runTestQuickPick.bind(null, it.skip.bind(it)) as RunTestQuickPickFn
runTestMultilineQuickPick.only = __runTestQuickPick.bind(null, it.only.bind(it)) as RunTestQuickPickFn
runTestMultilineQuickPick.skip = __runTestQuickPick.bind(null, it.skip.bind(it)) as RunTestQuickPickFn

function __runTest(func: TestFunction, test: string, options: Options = {}) {
  const [title, ...dsl] = test.split('|')
  func(title.trim(), testTemplate('|' + dsl.join('|'), options))
}

function __runTestMultiline(func: TestFunction, test: string, options: Options = {}) {
  const [title, ...dsl] = test.split(/\r?\n/)
  func(title.trim(), testTemplate(dsl.join(EOL), options))
}

function __runTestQuickPick(func: TestFunction, test: string, trimWhitespaces?: boolean, skipSuggestions?: number, cancelQuickPick?: boolean) {
  const [title, ...dsl] = test.split('|')
  func(title.trim(), testTemplateWithQuickPick('|' + dsl.join('|'), trimWhitespaces, skipSuggestions, cancelQuickPick))
}

function __runTestMultilineQuickPick(func: TestFunction, test: string, trimWhitespaces?: boolean, skipSuggestions?: number, cancelQuickPick?: boolean) {
  const [title, ...dsl] = test.split(/\r?\n/)
  func(title.trim(), testTemplateWithQuickPick(dsl.join(EOL), trimWhitespaces, skipSuggestions, cancelQuickPick))
}
