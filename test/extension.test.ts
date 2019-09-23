//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

import * as assert from 'assert'
import * as vsc from 'vscode'

import { getCurrentSuggestion } from '../src/postfixCompletionProvider'
import { getCurrentDelay, delay } from './utils'
import { runTest as Test, runTestQuickPick as QuickPick } from './runner'

const LANGUAGE = 'postfix'

describe('Single line template tests', () => {
  Test('not template - already negated expression | !expr{not}             >> expr')
  Test('let template - binary expression          | a * 3{let}             >> let name = a * 3')
  Test('let template - method call                | obj.call(){let}        >> let name = obj.call()')
  Test('let template - property access expression | obj.a.b{let}           >> let name = obj.a.b')
  Test('let template - element access expression  | obj.a[b]{let}          >> let name = obj.a[b]')
  Test('let template - postifx unary operator     | counter++{let}         >> let name = counter++')
  Test('let template - new expression             | new Type(1, 2, 3){let} >> let name = new Type(1, 2, 3)')

  Test('var template   | a.b{var}   >> var name = a.b')
  Test('const template | a.b{const} >> const name = a.b')

  Test('log template   | expr{log}   >> console.log(expr)')
  Test('warn template  | expr{warn}  >> console.warn(expr)')
  Test('error template | expr{error} >> console.error(expr)')

  Test('return template | expr{return}       >> return expr')
  Test('return template | new Type(){return} >> return new Type()')

  Test('not template                                            | expr{not}                   >> !expr')
  Test('not template - inside a call expression                 | call.expression(expr{not})  >> call.expression(!expr)')
  Test('not template - inside a call expression - negated       | call.expression(!expr{not}) >> call.expression(expr)')
  Test('not template - binary expression                        | x * 100{not}                >> !(x * 100)')
  Test('not template - inside an if - identifier                | if (expr{not})              >> if(!expr)', true)
  Test('not template - inside an if - binary                    | if (x * 100{not})           >> if(!(x*100))', true)
  Test('not template - already negated expression - method call | !x.method(){not}            >> x.method()')

  QuickPick('not template - complex conditions - first expression        | if (a > b && x * 100{not})    >> if(a>b&&!(x*100))', true, 0)
  QuickPick('not template - complex conditions - second expression       | if (a > b && x * 100{not})    >> if(a<=b||!(x*100))', true, 1)
  QuickPick('not template - complex conditions - cancel quick pick       | if (a > b && x * 100{not})    >> if(a>b&&x*100.)', true, 0, true)
  QuickPick('not template - complex conditions - first expression - alt  | if (a > b && x * 100{not}) {} >> if(a>b&&!(x*100)){}', true, 0)
  QuickPick('not template - complex conditions - second expression - alt | if (a > b && x * 100{not}) {} >> if(a<=b||!(x*100)){}', true, 1)
  QuickPick('not template - complex conditions - cancel quick pick - alt | if (a > b && x * 100{not}) {} >> if(a>b&&x*100.){}', true, 0, true)

  Test('if template                       | expr{if}      >> if(expr){}', true)
  Test('else template                     | expr{else}    >> if(!expr){}', true)
  Test('else template - binary expression | x * 100{else} >> if(!(x*100)){}', true)

  Test('null template         | expr{null}         >> if(expr===null){}', true)
  Test('notnull template      | expr{notnull}      >> if(expr!==null){}', true)
  Test('undefined template    | expr{undefined}    >> if(expr===undefined){}', true)
  Test('notundefined template | expr{notundefined} >> if(expr!==undefined){}', true)

  Test('forof template   | expr{forof}   >> for(letitemofexpr){}', true)
  Test('foreach template | expr{foreach} >> expr.forEach(item=>)', true)

  Test('cast template   | expr{cast}   >> (<>expr)')
  Test('castas template | expr{castas} >> (expr as )')

  describe('custom template tests', () => {
    const config = vsc.workspace.getConfiguration('postfix')

    before(done => {
      config.update('customTemplates', [{
        'name': 'custom',
        'body': '!{{expr}}',
        'description': '!expr',
        'when': [
          'identifier', 'unary-expression', 'binary-expression', 'expression', 'function-call', 'new-expression'
        ]
      }], true).then(() => done(), err => done(err))
    })

    after(done => {
      config.update('customTemplates', undefined, true).then(() => done(), err => done(err))
    })

    Test('identifier        | expr{custom}        >> !expr')
    Test('expression        | expr.test{custom}   >> !expr.test')
    Test('expression 2      | expr[index]{custom} >> !expr[index]')
    Test('binary-expression | x > 100{custom}     >> !x > 100')
    Test('unary-expression  | !x{custom}          >> !!x')
    Test('function-call     | call(){custom}      >> !call()')
    Test('function-call 2   | test.call(){custom} >> !test.call()')
    Test('new-expression    | new Type(){custom}  >> !new Type()')
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
      config.update('customTemplates', undefined, true).then(() => done(), err => done(err))
    })

    Test('identifier        | expr{double}        >> expr + expr')
    Test('expression        | expr.test{double}   >> expr.test + expr.test')
    Test('expression 2      | expr[index]{double} >> expr[index] + expr[index]')
    Test('binary-expression | x > 100{double}     >> x > 100 + x > 100')
    Test('unary-expression  | !x{double}          >> !x + !x')
    Test('function-call     | call(){double}      >> call() + call()')
    Test('function-call 2   | test.call(){double} >> test.call() + test.call()')
  })
})

function testTemplate(initialText: string, template: string, expectedResult: string, trimWhitespaces?: boolean, preAssertAction?: () => Thenable<void>) {
  return (done: Mocha.Done) => {
    vsc.workspace.openTextDocument({ language: LANGUAGE }).then((doc) => {
      return selectAndAcceptSuggestion(
        doc, initialText, template
      ).then(async () => {
        if (preAssertAction) {
          await preAssertAction()
        }

        assertText(doc, expectedResult, trimWhitespaces)
        await vsc.commands.executeCommand('workbench.action.closeActiveEditor')
        done()
      }).then(undefined, async (reason) => {
        await vsc.commands.executeCommand('workbench.action.closeActiveEditor')
        done(reason)
      })
    })
  }
}

function testTemplateWithQuickPick(initialText: string, template: string, expectedResult: string, trimWhitespaces?: boolean, skipSuggestions: number = 0, cancelQuickPick: boolean = false) {
  return testTemplate(initialText, template, expectedResult, trimWhitespaces, async () => {
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

function selectAndAcceptSuggestion(doc: vsc.TextDocument, initialText: string, template: string) {
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

function assertText(doc: vsc.TextDocument, expectedResult: string, trimWhitespaces: boolean) {
  let result = doc.getText()

  if (trimWhitespaces) {
    result = result.replace(/\s/g, '')
  }

  assert.strictEqual(result, expectedResult)
}
