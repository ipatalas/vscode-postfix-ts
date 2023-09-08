import * as vsc from 'vscode'
import * as assert from 'assert'
import { describe, before, after, TestFunction, it } from 'mocha'
import { getCurrentSuggestion } from '../src/postfixCompletionProvider'
import { parseDSL, ITestDSL } from './dsl'
import { runTest } from './runner'
import { EOL } from 'node:os'
import { CustomTemplateBodyType } from '../src/utils/templates'

const LANGUAGE = 'postfix'

const config = vsc.workspace.getConfiguration('editor', null)
export const TabSize = config.get<number>('tabSize') ?? 4

export function delay(timeout: number) {
  return new Promise<void>(resolve => setTimeout(resolve, timeout))
}

// for some reason editor.action.triggerSuggest needs more delay at the beginning when the process is not yet "warmed up"
// let's start from high delays and then slowly go to lower delays
const delaySteps = [2000, 1200, 700, 400, 300, 250]

export const getCurrentDelay = () => (delaySteps.length > 1) ? <number>delaySteps.shift() : delaySteps[0]

export type TestTemplateOptions = Partial<{
  trimWhitespaces: boolean
  preAssertAction: () => Thenable<void>
  fileContext: string
  fileLanguage: string
  extraDelay: number
}>

export function testTemplate(dslString: string, options: TestTemplateOptions = {}) {
  const dsl = parseDSL(dslString)

  return (done: Mocha.Done) => {
    vsc.workspace.openTextDocument({ language: options.fileLanguage || LANGUAGE }).then(async (doc) => {
      try {
        await selectAndAcceptSuggestion(doc, dsl, options.fileContext)
        await delay(options.extraDelay || 0)
        await options.preAssertAction?.()

        const expected = options.fileContext
          ? options.fileContext.trim().replace('{{CODE}}', dsl.expected)
          : dsl.expected

        assertText(doc, expected, options.trimWhitespaces)
        await vsc.commands.executeCommand('workbench.action.closeActiveEditor')
        done()
      } catch (reason) {
        await vsc.commands.executeCommand('workbench.action.closeActiveEditor')
        done(reason)
      }
    })
  }
}

export function testTemplateWithQuickPick(dslString: string, trimWhitespaces?: boolean, skipSuggestions = 0, cancelQuickPick = false) {
  return testTemplate(dslString, {
    trimWhitespaces, preAssertAction: async () => {
      if (cancelQuickPick) {
        await vsc.commands.executeCommand('workbench.action.closeQuickOpen')
      } else {
        await delay(100)

        for (let i = 0; i < skipSuggestions; i++) {
          await vsc.commands.executeCommand('workbench.action.quickOpenSelectNext')
        }

        await vsc.commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem')
      }

      await delay(100)
    }
  })
}

async function selectAndAcceptSuggestion(doc: vsc.TextDocument, dsl: ITestDSL, fileContext?: string) {
  const editor = await vsc.window.showTextDocument(doc, vsc.ViewColumn.One)

  let startPosition = new vsc.Position(0, 0)

  if (fileContext) {
    fileContext = fileContext.trim()
    const [before, after] = fileContext.split('{{CODE}}')
    await editor.edit(edit => edit.insert(new vsc.Position(0, 0), before))
    startPosition = editor.selection.start
    await editor.edit(edit => edit.insert(startPosition, after))
  }

  if (await editor.edit(edit => edit.insert(startPosition, dsl.input))) {
    const { character, line } = dsl.cursorPosition
    const pos = startPosition.translate(line, character)

    editor.selection = new vsc.Selection(pos, pos)

    await vsc.commands.executeCommand('editor.action.triggerSuggest')
    await delay(getCurrentDelay())

    let current = getCurrentSuggestion()
    const first = current

    while (current !== dsl.template) {
      await vsc.commands.executeCommand('selectNextSuggestion')
      current = getCurrentSuggestion()

      if (current === first) {
        break
      }
    }

    return vsc.commands.executeCommand('acceptSelectedSuggestion')
  }
}

function assertText(doc: vsc.TextDocument, expectedResult: string, trimWhitespaces = false) {
  let result = doc.getText()

  if (trimWhitespaces) {
    result = result.replaceAll(/\s/g, '')
    expectedResult = expectedResult.replaceAll(/\s/g, '')
  }

  assert.strictEqual(normalizeWhitespaces(result), normalizeWhitespaces(expectedResult))
}

function normalizeWhitespaces(text: string) {
  return text
    .split(/\r?\n/g)
    .map(line => line.replace(/\t/g, ' '.repeat(TabSize)))
    .join(EOL)
}

export function runWithCustomTemplate(template: CustomTemplateBodyType) {
  const postfixConfig = vsc.workspace.getConfiguration('postfix')
  return (when: string, ...tests: string[]) =>
    describe(when, () => {
      before(setCustomTemplate(postfixConfig, 'custom', template, [when]))
      after(resetCustomTemplates(postfixConfig))

      tests.forEach(t => runTest(t))
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

type ParametersSkipFirst<T extends (...args: unknown[]) => void> = T extends (first: TestFunction, ...args: infer P) => void ? P : never
type TestFnSkipFirstParam<T extends (...args: unknown[]) => void> = (...args: ParametersSkipFirst<T>) => void
type RunTestFn<T extends (...args: unknown[]) => void> = TestFnSkipFirstParam<T> & {
  only: TestFnSkipFirstParam<T>
  skip: TestFnSkipFirstParam<T>
}

export function makeTestFunction<T extends (first: TestFunction, ...args: unknown[]) => void>(testFn: T) {
  const result = testFn.bind(null, it) as RunTestFn<T>
  result.only = testFn.bind(null, it.only.bind(it)) as RunTestFn<T>
  result.skip = testFn.bind(null, it.skip.bind(it)) as RunTestFn<T>

  return result
}
