import * as vsc from 'vscode'
import { makeTestFunction, testTemplate, TestTemplateOptions, testTemplateWithQuickPick } from './utils'
import { EOL } from 'os'
import { describe, before, after, TestFunction } from 'mocha'
import { CustomTemplateBodyType } from '../src/utils/templates'

export type Options = Omit<TestTemplateOptions, 'preAssertAction'>

export const runTest = makeTestFunction<typeof __runTest>(__runTest)
export const runTestMultiline = makeTestFunction<typeof __runTestMultiline>(__runTestMultiline)
export const runTestQuickPick = makeTestFunction<typeof __runTestQuickPick>(__runTestQuickPick)
export const runTestMultilineQuickPick = makeTestFunction<typeof __runTestMultilineQuickPick>(__runTestMultilineQuickPick)

function __runTest(func: TestFunction, test: string, options: Options = {}) {
  const [title, ...dsl] = test.split('|') as [string, ...string[]]
  func(title.trim(), testTemplate('|' + dsl.join('|'), options))
}

function __runTestMultiline(func: TestFunction, test: string, options: Options = {}) {
  const [title, ...dsl] = test.split(/\r?\n/) as [string, ...string[]]
  func(title.trim(), testTemplate(dsl.join(EOL), options))
}

function __runTestQuickPick(func: TestFunction, test: string, trimWhitespaces?: boolean, skipSuggestions?: number, cancelQuickPick?: boolean) {
  const [title, ...dsl] = test.split('|') as [string, ...string[]]
  func(title.trim(), testTemplateWithQuickPick('|' + dsl.join('|'), trimWhitespaces, skipSuggestions, cancelQuickPick))
}

function __runTestMultilineQuickPick(func: TestFunction, test: string, trimWhitespaces?: boolean, skipSuggestions?: number, cancelQuickPick?: boolean) {
  const [title, ...dsl] = test.split(/\r?\n/) as [string, ...string[]]
  func(title.trim(), testTemplateWithQuickPick(dsl.join(EOL), trimWhitespaces, skipSuggestions, cancelQuickPick))
}


export function runWithCustomTemplate(template: CustomTemplateBodyType) {
  const postfixConfig = vsc.workspace.getConfiguration('postfix')
  return (when: string, ...tests: string[]) =>
    describe(when, () => {
      before(setCustomTemplate(postfixConfig, 'custom', template, [when]))
      after(resetCustomTemplates(postfixConfig))

      tests.forEach(t => {
        runTest(t)
      })
    })
}

function setCustomTemplate(config: vsc.WorkspaceConfiguration, name: string, body: CustomTemplateBodyType, when: string[]) {
  return (done: Mocha.Done) => {
    config.update('customTemplates', [{
      'name': name,
      'body': body,
      'description': 'custom description',
      'when': when
    }], true).then(done, done)
  }
}

function resetCustomTemplates(config: vsc.WorkspaceConfiguration) {
  return (done: Mocha.Done) => {
    config.update('customTemplates', undefined, true).then(done, done)
  }
}
