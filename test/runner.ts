import { Func, Test } from 'mocha'
import { testTemplate, testTemplateWithQuickPick } from './utils'

export const runTest = (test: string, trimWhitespaces?: boolean) => __runTest(it, test, trimWhitespaces)
runTest.only = (test: string, trimWhitespaces?: boolean) => __runTest(it.only.bind(it), test, trimWhitespaces)
runTest.skip = (test: string, trimWhitespaces?: boolean) => __runTest(it.skip.bind(it), test, trimWhitespaces)

function __runTest(func: (title: string, fn?: Func) => Test, test: string, trimWhitespaces?: boolean) {
  const [title, ...dsl] = test.split('|')
  func(title, testTemplate('|' + dsl.join('|'), trimWhitespaces))
}

export const runTestQuickPick = (test: string, trimWhitespaces?: boolean, skipSuggestions: number = 0, cancelQuickPick: boolean = false) =>
  __runTestQuickPick(it, test, trimWhitespaces, skipSuggestions, cancelQuickPick)

runTestQuickPick.only = (test, trimWhitespaces?: boolean, skipSuggestions?: number, cancelQuickPick?: boolean) =>
  __runTestQuickPick(it.only.bind(it), test, trimWhitespaces, skipSuggestions, cancelQuickPick)

runTestQuickPick.skip =  (test, trimWhitespaces?: boolean, skipSuggestions?: number, cancelQuickPick?: boolean) =>
  __runTestQuickPick(it.skip.bind(it), test, trimWhitespaces, skipSuggestions, cancelQuickPick)

function __runTestQuickPick(func: (title: string, fn?: Func) => Test, test: string, trimWhitespaces?: boolean, skipSuggestions?: number, cancelQuickPick?: boolean) {
  const [title, ...dsl] = test.split('|')
  func(title, testTemplateWithQuickPick('|' + dsl.join('|'), trimWhitespaces, skipSuggestions, cancelQuickPick))
}
