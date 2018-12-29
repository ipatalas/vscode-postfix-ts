//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert'
import * as _ from 'lodash'
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vsc from 'vscode'
import { getCurrentSuggestion, resetCurrentSuggestion } from '../src/postfixCompletionProvider'
import { getCurrentDelay, delay } from './utils'

const LANGUAGE = 'postfix'

const VAR_TEMPLATES = ['var', 'let', 'const']
const FOR_TEMPLATES = ['for', 'forof', 'foreach']
const CONSOLE_TEMPLATES = ['log', 'warn', 'error']
const IF_TEMPLATES = ['if', 'else', 'null', 'notnull', 'undefined', 'notundefined']
const CAST_TEMPLATES = ['cast', 'castas']
const ALL_TEMPLATES = [
  ...VAR_TEMPLATES,
  ...FOR_TEMPLATES,
  ...CONSOLE_TEMPLATES,
  ...IF_TEMPLATES,
  ...CAST_TEMPLATES,
  'not',
  'return'
]

describe('Template usage', () => {
  afterEach(done => {
    vsc.commands.executeCommand('workbench.action.closeOtherEditors').then(() => done(), err => done(err))
  })

  testTemplateUsage('identifier expression', 'expr', ALL_TEMPLATES)
  testTemplateUsage('method call expression', 'expr.call()', ALL_TEMPLATES)
  testTemplateUsage('property access expression', 'expr.a.b.c', ALL_TEMPLATES)
  testTemplateUsage('element access expression', 'expr.a.b[c]', ALL_TEMPLATES)
  testTemplateUsage('unary expression', 'expr++', _.difference(ALL_TEMPLATES, FOR_TEMPLATES))
  testTemplateUsage('conditional expression', 'if (x * 100{cursor})', ['not'])
  testTemplateUsage('return expression', 'return x * 100', ['not'])
  testTemplateUsage('inside single line comment', '// expr', [])
  testTemplateUsage('inside multi line comment', '/* expr{cursor} */', [])
})

function testTemplateUsage (testDescription: string, initialText: string, expectedTemplates: string[]) {
  it(testDescription, (done: MochaDone) => {
    vsc.workspace.openTextDocument({ language: LANGUAGE }).then((doc) => {
      return getAvailableSuggestions(doc, initialText).then(templates => {
        assert.deepEqual(_.sortBy(templates), _.sortBy(expectedTemplates))
        done()
      }).then(undefined, (reason) => {
        done(reason)
      })
    })
  })
}

function getAvailableSuggestions (doc: vsc.TextDocument, initialText: string) {
  return vsc.window.showTextDocument(doc, vsc.ViewColumn.One).then((editor) => {
    let cursorIdx = initialText.indexOf('{cursor}')
    if (cursorIdx > -1) {
      initialText = initialText.replace('{cursor}', '.')
    } else {
      initialText += '.'
      cursorIdx = initialText.length
    }

    return editor.edit(edit => {
      edit.insert(new vsc.Position(0, 0), initialText)
    }).then(async () => {
      let pos = new vsc.Position(0, cursorIdx + 1)
      editor.selection = new vsc.Selection(pos, pos)

      resetCurrentSuggestion()
      await vsc.commands.executeCommand('editor.action.triggerSuggest')
      await delay(getCurrentDelay())

      const firstSuggestion = getCurrentSuggestion()
      const suggestions = firstSuggestion ? [firstSuggestion] : []

      while (true) {
        await vsc.commands.executeCommand('selectNextSuggestion')

        let current = getCurrentSuggestion()

        if (current === undefined || suggestions.indexOf(current) > -1) {
          break
        }

        suggestions.push(current)
      }

      return suggestions
    })
  })
}
