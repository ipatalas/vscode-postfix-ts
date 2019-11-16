import * as vsc from 'vscode'
import * as assert from 'assert'
import { getCurrentSuggestion } from '../src/postfixCompletionProvider'
import { parseDSL, ITestDSL } from './dsl'

const EOL = require('os').EOL
const LANGUAGE = 'postfix'

const config = vsc.workspace.getConfiguration('editor', null)
export const TabSize = config.get<number>('tabSize')

export function delay(timeout) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, timeout)
  })
}

// for some reason editor.action.triggerSuggest needs more delay at the beginning when the process is not yet "warmed up"
// let's start from high delays and then slowly go to lower delays
let delaySteps = [2000, 1200, 700, 400, 300, 250]

export const getCurrentDelay = () => (delaySteps.length > 1) ? delaySteps.shift() : delaySteps[0]

export function testTemplate(dslString: string, trimWhitespaces?: boolean, preAssertAction?: () => Thenable<void>) {
  const dsl = parseDSL(dslString)

  return (done: Mocha.Done) => {
    vsc.workspace.openTextDocument({ language: LANGUAGE }).then((doc) => {
      return selectAndAcceptSuggestion(doc, dsl).then(async () => {
        if (preAssertAction) {
          await preAssertAction()
        }

        assertText(doc, dsl.expected, trimWhitespaces)
        await vsc.commands.executeCommand('workbench.action.closeActiveEditor')
        done()
      }).then(undefined, async (reason) => {
        await vsc.commands.executeCommand('workbench.action.closeActiveEditor')
        done(reason)
      })
    })
  }
}

export function testTemplateWithQuickPick(dslString: string, trimWhitespaces?: boolean, skipSuggestions: number = 0, cancelQuickPick: boolean = false) {
  return testTemplate(dslString, trimWhitespaces, async () => {
    if (cancelQuickPick) {
      await vsc.commands.executeCommand('workbench.action.closeQuickOpen')
    } else {
      for (let i = 0; i < skipSuggestions; i++) {
        await vsc.commands.executeCommand('workbench.action.quickOpenSelectNext')
      }

      await vsc.commands.executeCommand('workbench.action.focusQuickOpen')
      await vsc.commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem')
    }

    await delay(10)
  })
}

async function selectAndAcceptSuggestion(doc: vsc.TextDocument, dsl: ITestDSL) {
  const editor = await vsc.window.showTextDocument(doc, vsc.ViewColumn.One)

  if (await editor.edit(edit => edit.insert(new vsc.Position(0, 0), dsl.input))) {
    let pos = new vsc.Position(dsl.cursorPosition.line, dsl.cursorPosition.character)

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

function assertText(doc: vsc.TextDocument, expectedResult: string, trimWhitespaces: boolean) {
  let result = doc.getText()

  if (trimWhitespaces) {
    result = result.replace(/\s/g, '')
  }

  assert.strictEqual(normalizeWhitespaces(result), normalizeWhitespaces(expectedResult))
}

function normalizeWhitespaces(text: string) {
  return text
    .split(/\r?\n/g)
    .map(line => line.replace(/\t/g, ' '.repeat(TabSize)))
    .join(EOL)
}
