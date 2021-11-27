import { Func, Test } from 'mocha'
import { testTemplate, testTemplateWithQuickPick } from './utils'
import { EOL } from 'os'
import { it } from 'mocha';

export const runTest = (test: string, trimWhitespaces?: boolean) => __runTest(it, test, trimWhitespaces)
runTest.only = (test: string, trimWhitespaces?: boolean) => __runTest(it.only.bind(it), test, trimWhitespaces)
runTest.skip = (test: string, trimWhitespaces?: boolean) => __runTest(it.skip.bind(it), test, trimWhitespaces)

function __runTest(func: (title: string, fn?: Func) => Test, test: string, trimWhitespaces?: boolean) {
  const [title, ...dsl] = test.split('|')
  func(title.trim(), testTemplate('|' + dsl.join('|'), trimWhitespaces))
}

export const runTestMultiline = (test: string, trimWhitespaces?: boolean) => __runTestMultiline(it, test, trimWhitespaces)
runTestMultiline.only = (test: string, trimWhitespaces?: boolean) => __runTestMultiline(it.only.bind(it), test, trimWhitespaces)
runTestMultiline.skip = (test: string, trimWhitespaces?: boolean) => __runTestMultiline(it.skip.bind(it), test, trimWhitespaces)

function __runTestMultiline(func: (title: string, fn?: Func) => Test, test: string, trimWhitespaces?: boolean) {
  const [title, ...dsl] = test.split(/\r?\n/)
  func(title.trim(), testTemplate(dsl.join(EOL), trimWhitespaces))
}

export const runTestQuickPick = (test: string, trimWhitespaces?: boolean, skipSuggestions = 0, cancelQuickPick = false) =>
  __runTestQuickPick(it, test, trimWhitespaces, skipSuggestions, cancelQuickPick)

runTestQuickPick.only = (test, trimWhitespaces?: boolean, skipSuggestions?: number, cancelQuickPick?: boolean) =>
  __runTestQuickPick(it.only.bind(it), test, trimWhitespaces, skipSuggestions, cancelQuickPick)

runTestQuickPick.skip = (test, trimWhitespaces?: boolean, skipSuggestions?: number, cancelQuickPick?: boolean) =>
  __runTestQuickPick(it.skip.bind(it), test, trimWhitespaces, skipSuggestions, cancelQuickPick)

function __runTestQuickPick(func: (title: string, fn?: Func) => Test, test: string, trimWhitespaces?: boolean, skipSuggestions?: number, cancelQuickPick?: boolean) {
  const [title, ...dsl] = test.split('|')
  func(title.trim(), testTemplateWithQuickPick('|' + dsl.join('|'), trimWhitespaces, skipSuggestions, cancelQuickPick))
}
