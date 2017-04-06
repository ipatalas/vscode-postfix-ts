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

suite('Simple template tests', () => {
	test('let template - binary expression', testTemplate('a * 3', 'let', 'let name = a * 3'))
	test('let template - method call', testTemplate('obj.call()', 'let', 'let name = obj.call()'))
	test('let template - property access expression', testTemplate('obj.a.b', 'let', 'let name = obj.a.b'))
	test('let template - postifx unary operator', testTemplate('counter++', 'let', 'let name = counter++'))

	test('var template', testTemplate('a.b', 'var', 'var name = a.b'))
	test('const template', testTemplate('a.b', 'const', 'const name = a.b'))

	test('log template', testTemplate('expr', 'log', 'console.log(expr)', false, 1))
	test('warn template', testTemplate('expr', 'warn', 'console.warn(expr)'))
	test('error template', testTemplate('expr', 'error', 'console.error(expr)'))

	test('return template', testTemplate('expr', 'return', 'return expr'))

	test('not template', testTemplate('expr', 'not', '!expr'))
	test('not template - binary expression', testTemplate('x * 100', 'not', '!(x * 100)'))
	test('not template - inside an if', testTemplate('if (x * 100{cursor})', 'not', 'if(!(x*100))', true))
	test('not template - inside an if with complex conditions', testTemplate('if (a > b && x * 100{cursor})', 'not', 'if(a>b&&!(x*100))', true))

	test('if template', testTemplate('expr', 'if', 'if(expr){}', true, 2))
	test('else template', testTemplate('expr', 'else', 'if(!expr){}', true))
	test('else template - binary expression', testTemplate('x * 100', 'else', 'if(!(x*100)){}', true, 2))

	test('null template', testTemplate('expr', 'null', 'if(expr===null){}', true, 1))
	test('notnull template', testTemplate('expr', 'notnull', 'if(expr!==null){}', true))
	test('undefined template', testTemplate('expr', 'undefined', 'if(expr===undefined){}', true))
	test('notundefined template', testTemplate('expr', 'notundefined', 'if(expr!==undefined){}', true))

	test('forof template', testTemplate('expr', 'forof', 'for(letitemofexpr){}', true))
})

function testTemplate (initialText: string, template: string, expectedResult: string, trimWhitespaces?: boolean, skipSuggestions: number = 0) {
	return (done: MochaDone) => {
		vsc.workspace.openTextDocument({ language: 'typescript' }).then((doc) => {
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

					for (let i = 0; i < skipSuggestions; i++) {
						await vsc.commands.executeCommand('selectNextSuggestion')
					}

					return vsc.commands.executeCommand('acceptSelectedSuggestion')
				})
			}).then(() => {
				let result = doc.getText()

				if (trimWhitespaces) {
					result = result.replace(/\s/g, '')
				}

				assert.equal(result, expectedResult)

				done()
			}).then(undefined, (reason) => {
				done(reason)
			})
		})
	}
}

function delay (timeout) {
	return new Promise<void>(resolve => {
		setTimeout(resolve, timeout)
	})
}

// for some reason editor.action.triggerSuggest needs more delay at the beginning when the process is not yet warmed up
// let's start from high delays and then slowly go to lower delays
let delaySteps = [3500, 2000, 1200, 700, 400, 200, 100]

const getCurrentDelay = () => (delaySteps.length > 1) ? delaySteps.shift() : delaySteps[0]
