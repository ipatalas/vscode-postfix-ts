//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert'
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vsc from 'vscode'
import { VarTemplate } from '../src/templates/varTemplates'
import { getCurrentSuggestion } from '../src/postfixCompletionProvider'
import { getCurrentDelay, delay } from './utils'

const LANGUAGE = 'postfix'

describe('Simple template tests', () => {
  afterEach(done => {
    vsc.commands.executeCommand('workbench.action.closeOtherEditors').then(() => done(), err => done(err))
  })

  it('not template - already negated expression', testTemplate('!expr', 'not', 'expr'))
  it('let template - binary expression', testTemplate('a * 3', 'let', 'let name = a * 3'))
  it('let template - method call', testTemplate('obj.call()', 'let', 'let name = obj.call()'))
  it('let template - property access expression', testTemplate('obj.a.b', 'let', 'let name = obj.a.b'))
  it('let template - element access expression', testTemplate('obj.a[b]', 'let', 'let name = obj.a[b]'))
  it('let template - postifx unary operator', testTemplate('counter++', 'let', 'let name = counter++'))

  it('var template', testTemplate('a.b', 'var', 'var name = a.b'))
  it('const template', testTemplate('a.b', 'const', 'const name = a.b'))

  it('log template', testTemplate('expr', 'log', 'console.log(expr)', false))
  it('warn template', testTemplate('expr', 'warn', 'console.warn(expr)'))
  it('error template', testTemplate('expr', 'error', 'console.error(expr)'))

  it('return template', testTemplate('expr', 'return', 'return expr'))

  it('not template', testTemplate('expr', 'not', '!expr'))
  it('not template - inside a call expression', testTemplate('call.expression(expr{cursor})', 'not', 'call.expression(!expr)'))
  it('not template - inside a call expression - negated', testTemplate('call.expression(!expr{cursor})', 'not', 'call.expression(expr)'))
  it('not template - binary expression', testTemplate('x * 100', 'not', '!(x * 100)'))
  it('not template - inside an if - identifier', testTemplate('if (expr{cursor})', 'not', 'if(!expr)', true))
  it('not template - inside an if - binary', testTemplate('if (x * 100{cursor})', 'not', 'if(!(x*100))', true))
  it('not template - already negated expression - method call', testTemplate('!x.method()', 'not', 'x.method()'))
  it('not template - complex conditions - first expression', testTemplateWithOptions('if (a > b && x * 100{cursor})', 'not', 'if(a>b&&!(x*100))', true, 0))
  it('not template - complex conditions - second expression', testTemplateWithOptions('if (a > b && x * 100{cursor})', 'not', 'if(a<=b||!(x*100))', true, 1))
  it('not template - complex conditions - cancel quick pick', testTemplateWithOptions('if (a > b && x * 100{cursor})', 'not', 'if(a>b&&x*100.)', true, 0, true))
  it('not template - complex conditions - first expression - alt', testTemplateWithOptions('if (a > b && x * 100{cursor}) {}', 'not', 'if(a>b&&!(x*100)){}', true, 0))
  it('not template - complex conditions - second expression - alt', testTemplateWithOptions('if (a > b && x * 100{cursor}) {}', 'not', 'if(a<=b||!(x*100)){}', true, 1))
  it('not template - complex conditions - cancel quick pick - alt', testTemplateWithOptions('if (a > b && x * 100{cursor}) {}', 'not', 'if(a>b&&x*100.){}', true, 0, true))

  it('if template', testTemplate('expr', 'if', 'if(expr){}', true))
  it('else template', testTemplate('expr', 'else', 'if(!expr){}', true))
  it('else template - binary expression', testTemplate('x * 100', 'else', 'if(!(x*100)){}', true))

  it('null template', testTemplate('expr', 'null', 'if(expr===null){}', true))
  it('notnull template', testTemplate('expr', 'notnull', 'if(expr!==null){}', true))
  it('undefined template', testTemplate('expr', 'undefined', 'if(expr===undefined){}', true))
  it('notundefined template', testTemplate('expr', 'notundefined', 'if(expr!==undefined){}', true))

  it('forof template', testTemplate('expr', 'forof', 'for(letitemofexpr){}', true))
  it('foreach template', testTemplate('expr', 'foreach', 'expr.forEach(item=>)', true))

  describe('custom template tests', () => {
    const config = vsc.workspace.getConfiguration('postfix')

    before(done => {
      config.update('customTemplates', [{
        'name': 'custom',
        'body': '!{{expr}}',
        'description': '!expr',
        'when': [
          'identifier', 'unary-expression', 'binary-expression', 'expression', 'function-call'
        ]
      }], true).then(() => done(), err => done(err))
    })

    after(done => {
      config.update('customTemplates', undefined, true).then(done, err => done(err))
    })

    it('identifier', testTemplate('expr', 'custom', '!expr'))
    it('expression', testTemplate('expr.test', 'custom', '!expr.test'))
    it('expression 2', testTemplate('expr[index]', 'custom', '!expr[index]'))
    it('binary-expression', testTemplate('x > 100', 'custom', '!x > 100'))
    it('unary-expression', testTemplate('!x', 'custom', '!!x'))
    it('function-call', testTemplate('call()', 'custom', '!call()'))
    it('function-call 2', testTemplate('test.call()', 'custom', '!test.call()'))
  })

  describe('custom template with multiple expr tests', () => {
    const config = vsc.workspace.getConfiguration('postfix')

    before(done => {
      config.update('customTemplates', [{
        'name': 'double',
        'body': '{{expr}} + {{expr}}',
        'description': 'double expr',
        'when': [
          'identifier', 'unary-expression', 'binary-expression', 'expression', 'function-call'
        ]
      }], true).then(() => done(), err => done(err))
    })

    after(done => {
      config.update('customTemplates', undefined, true).then(done, err => done(err))
    })

    it('identifier', testTemplate('expr', 'double', 'expr + expr'))
    it('expression', testTemplate('expr.test', 'double', 'expr.test + expr.test'))
    it('expression 2', testTemplate('expr[index]', 'double', 'expr[index] + expr[index]'))
    it('binary-expression', testTemplate('x > 100', 'double', 'x > 100 + x > 100'))
    it('unary-expression', testTemplate('!x', 'double', '!x + !x'))
    it('function-call', testTemplate('call()', 'double', 'call() + call()'))
    it('function-call 2', testTemplate('test.call()', 'double', 'test.call() + test.call()'))
  })
})

function testTemplate (initialText: string, template: string, expectedResult: string, trimWhitespaces?: boolean) {
  return (done: MochaDone) => {
    vsc.workspace.openTextDocument({ language: LANGUAGE }).then((doc) => {
      return selectAndAcceptSuggestion(
        doc, initialText, template
      ).then(() => {
        assertText(doc, expectedResult, trimWhitespaces)
        done()
      }).then(undefined, (reason) => {
        done(reason)
      })
    })
  }
}

function testTemplateWithOptions (initialText: string, template: string, expectedResult: string, trimWhitespaces?: boolean, skipSuggestions: number = 0, cancelQuickPick: boolean = false) {
  return (done: MochaDone) => {
    vsc.workspace.openTextDocument({ language: LANGUAGE }).then((doc) => {
      return selectAndAcceptSuggestion(
        doc, initialText, template
      ).then(async () => {
        if (cancelQuickPick) {
          await vsc.commands.executeCommand('workbench.action.closeQuickOpen')
        } else {
          for (let i = 0; i < skipSuggestions; i++) {
            await vsc.commands.executeCommand('workbench.action.quickOpenSelectNext')
          }

          await vsc.commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem')
        }

        await delay(10)

        assertText(doc, expectedResult, trimWhitespaces)
        done()
      }).then(undefined, (reason) => {
        done(reason)
      })
    })
  }
}

function selectAndAcceptSuggestion (doc: vsc.TextDocument, initialText: string, template: string) {
  return vsc.window.showTextDocument(doc, vsc.ViewColumn.One).then((editor) => {
    let cursorIdx = initialText.indexOf('{cursor}')
    if (cursorIdx > -1) {
      initialText = initialText.replace('{cursor}', `.${template}`)
    } else {
      initialText += `.${template}`
      cursorIdx = initialText.length
    }

    return editor.edit(edit => {
      edit.insert(new vsc.Position(0, 0), initialText)
    }).then(async () => {
      let pos = new vsc.Position(0, cursorIdx + template.length + 1)
      editor.selection = new vsc.Selection(pos, pos)

      await vsc.commands.executeCommand('editor.action.triggerSuggest')
      await delay(getCurrentDelay())

      let current = getCurrentSuggestion()
      const first = current

      while (current !== template) {
        await vsc.commands.executeCommand('selectNextSuggestion')
        current = getCurrentSuggestion()

        if (current === first) {
          break
        }
      }

      return vsc.commands.executeCommand('acceptSelectedSuggestion')
    })
  })
}

function assertText (doc: vsc.TextDocument, expectedResult: string, trimWhitespaces: boolean) {
  let result = doc.getText()

  if (trimWhitespaces) {
    result = result.replace(/\s/g, '')
  }

  assert.equal(result, expectedResult)
}
