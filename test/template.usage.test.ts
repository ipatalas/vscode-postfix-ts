import * as assert from 'assert'
import * as _ from 'lodash'
import * as vsc from 'vscode'
import { describe, afterEach, before, after, TestFunction } from 'mocha'

import { getCurrentSuggestion, resetCurrentSuggestion, overrideTsxEnabled } from '../src/postfixCompletionProvider'
import { getCurrentDelay, delay, makeTestFunction } from './utils'

const LANGUAGE = 'postfix'

const VAR_TEMPLATES = ['var', 'let', 'const']
const FOR_TEMPLATES = ['for', 'forin', 'forof', 'foreach']
const CONSOLE_TEMPLATES = ['log', 'warn', 'error']
const EQUALITY_TEMPLATES = ['null', 'notnull', 'undefined', 'notundefined', 'new']
const IF_TEMPLATES = ['if', 'else', 'null', 'notnull', 'undefined', 'notundefined']
const CAST_TEMPLATES = ['cast', 'castas']
const TYPE_TEMPLATES = ['promisify']
const ALL_TEMPLATES = [
  ...VAR_TEMPLATES,
  ...FOR_TEMPLATES,
  ...CONSOLE_TEMPLATES,
  ...IF_TEMPLATES,
  ...CAST_TEMPLATES,
  'not',
  'return',
  'new',
  'await',
  'call'
]
const STRING_LITERAL_TEMPLATES = [
  ...VAR_TEMPLATES,
  ...CONSOLE_TEMPLATES,
  'return'
]

const BINARY_EXPRESSION_TEMPLATES = [
  ...VAR_TEMPLATES,
  ...CONSOLE_TEMPLATES,
  ...CAST_TEMPLATES,
  'if',
  'else',
  'not',
  'return',
  'call'
]

const config = vsc.workspace.getConfiguration('postfix')
const testTemplateUsage = makeTestFunction<typeof __testTemplateUsage>(__testTemplateUsage)

describe('Template usage', () => {
  afterEach(done => {
    vsc.commands.executeCommand('workbench.action.closeOtherEditors').then(() => done(), err => done(err))
  })

  testTemplateUsage('identifier expression', 'expr', ALL_TEMPLATES)
  testTemplateUsage('awaited expression', 'await expr', _.difference(ALL_TEMPLATES, ['new', 'await', 'forin']))
  testTemplateUsage('method call expression', 'expr.call()', _.difference(ALL_TEMPLATES, ['for', 'new']))
  testTemplateUsage('property access expression', 'expr.a.b.c', ALL_TEMPLATES)
  testTemplateUsage('element access expression', 'expr.a.b[c]', _.difference(ALL_TEMPLATES, ['new']))
  testTemplateUsage('binary expression', 'x > y', BINARY_EXPRESSION_TEMPLATES)
  testTemplateUsage('binary expression', '(x > y)', BINARY_EXPRESSION_TEMPLATES)
  testTemplateUsage('unary expression', 'expr++', _.difference(ALL_TEMPLATES, [...FOR_TEMPLATES, 'new', 'await']))
  testTemplateUsage('conditional expression', 'if (x * 100{cursor})', ['not'])
  testTemplateUsage('return expression', 'return x * 100', [...CAST_TEMPLATES, 'not', 'call'])
  testTemplateUsage('object literal expression', '{}', [...VAR_TEMPLATES, ...CONSOLE_TEMPLATES, 'return'])
  testTemplateUsage('object literal expression', '{foo:"foo"}', [...VAR_TEMPLATES, ...CONSOLE_TEMPLATES, 'return'])
  testTemplateUsage('new expression', 'new Class()', [...VAR_TEMPLATES, ...CONSOLE_TEMPLATES, ...CAST_TEMPLATES, 'return', 'call'])
  testTemplateUsage('expression as argument', 'function.call("arg", expr{cursor})', [...CAST_TEMPLATES, 'not', 'new', 'await', 'call'])

  testTemplateUsage('string literal - single quote', '\'a string\'', STRING_LITERAL_TEMPLATES)
  testTemplateUsage('string literal - double quote', '"a string"', STRING_LITERAL_TEMPLATES)
  testTemplateUsage('string literal - backtick', '`a string`', STRING_LITERAL_TEMPLATES)
  testTemplateUsage('string literal - backtick with var #1', '`a ${value} string`', STRING_LITERAL_TEMPLATES)
  testTemplateUsage('string literal - backtick with var #2', '`a string ${value}`', STRING_LITERAL_TEMPLATES)

  testTemplateUsage('function type - built-in', 'function f(): boolean', TYPE_TEMPLATES)
  testTemplateUsage('function type - custom', 'function f(): Type', TYPE_TEMPLATES)
  testTemplateUsage('var type - built-in', 'const x: boolean', TYPE_TEMPLATES)
  testTemplateUsage('var type - custom', 'const x: Type', TYPE_TEMPLATES)

  testTemplateUsage('inside return - arrow function', 'return items.map(x => { result{cursor} })', ALL_TEMPLATES)
  testTemplateUsage('inside return - function', 'return items.map(function(x) { result{cursor} })', ALL_TEMPLATES)

  testTemplateUsage('inside variable declaration', 'var test = expr{cursor}', [...CAST_TEMPLATES, ...EQUALITY_TEMPLATES, 'not', 'await', 'call'])
  testTemplateUsage('inside assignment statement', 'test = expr{cursor}', [...CAST_TEMPLATES, ...EQUALITY_TEMPLATES, 'not', 'call'])
  testTemplateUsage('inside assignment statement - short-circuit', 'test *= expr{cursor}', [...CAST_TEMPLATES, ...EQUALITY_TEMPLATES, 'not', 'call'])
  testTemplateUsage('inside return', 'return expr{cursor}', [...CAST_TEMPLATES, ...EQUALITY_TEMPLATES, 'not', 'await', 'call'])
  testTemplateUsage('inside single line comment', '// expr', [])
  testTemplateUsage('inside multi line comment', '/* expr{cursor} */', [])

  describe('JSX tests', () => {
    before(() => overrideTsxEnabled.value = true)

    testTemplateUsage('inside JSX fragment', '<>a{cursor}</>', [])
    testTemplateUsage('inside JSX element', '<p>a{cursor}</p>', [])
    testTemplateUsage('inside JSX expression', '<p hidden={showMe{cursor}}>test</p>', ALL_TEMPLATES)

    after(() => overrideTsxEnabled.value = false)
  })

  testTemplateUsage('inside var declaration - function', 'const f1 = function () { expr{cursor}', ALL_TEMPLATES)
  testTemplateUsage('inside var declaration - arrow function', 'const f3 = () => { expr{cursor}', ALL_TEMPLATES)
  testTemplateUsage('inside function', 'function f2() { expr{cursor}', ALL_TEMPLATES)
  testTemplateUsage('inside arrow function', '() => { expr{cursor}', ALL_TEMPLATES)

  testTemplateUsage('cursor in wrong place #1', 'test.something = {cursor-no-dot}', [])
  testTemplateUsage('cursor in wrong place #2', 'test.something = new{cursor-no-dot}', [])

  describe('when some templates are disabled', () => {
    before(setDisabledTemplates(config, ['var', 'forof']))
    after(setDisabledTemplates(config, []))

    testTemplateUsage('identifier expression', 'expr', _.difference(ALL_TEMPLATES, ['var', 'forof']))
  })
})

function setDisabledTemplates(config: vsc.WorkspaceConfiguration, value: string[]) {
  return (done: Mocha.Done) => {
    config.update('disabledBuiltinTemplates', value, true).then(done, done)
  }
}

function __testTemplateUsage(func: TestFunction, testDescription: string, initialText: string, expectedTemplates: string[]) {
  func(testDescription, (done: Mocha.Done) => {
    vsc.workspace.openTextDocument({ language: LANGUAGE }).then((doc) => {
      return getAvailableSuggestions(doc, initialText).then(templates => {
        assert.deepStrictEqual(_.sortBy(templates), _.sortBy(expectedTemplates))
        done()
      }).then(undefined, (reason) => {
        done(reason)
      })
    })
  })
}

async function getAvailableSuggestions(doc: vsc.TextDocument, initialText: string) {
  const editor = await vsc.window.showTextDocument(doc, vsc.ViewColumn.One)

  let cursorIdx = initialText.indexOf('{cursor}')
  if (cursorIdx > -1) {
    initialText = initialText.replace('{cursor}', '.')
  } else {
    cursorIdx = initialText.indexOf('{cursor-no-dot}')
    if (cursorIdx > -1) {
      initialText = initialText.replace('{cursor-no-dot}', '')
    } else {
      initialText += '.'
      cursorIdx = initialText.length
    }
  }

  if (await editor.edit(edit => edit.insert(new vsc.Position(0, 0), initialText))) {
    const pos = new vsc.Position(0, cursorIdx + 1)
    editor.selection = new vsc.Selection(pos, pos)

    resetCurrentSuggestion()
    await vsc.commands.executeCommand('editor.action.triggerSuggest')
    await delay(getCurrentDelay())

    const firstSuggestion = getCurrentSuggestion()
    const suggestions = firstSuggestion ? [firstSuggestion] : []

    while (true) {
      await vsc.commands.executeCommand('selectNextSuggestion')

      const current = getCurrentSuggestion()

      if (current === undefined || suggestions.indexOf(current) > -1) {
        break
      }

      suggestions.push(current)
    }

    return suggestions
  }
}
