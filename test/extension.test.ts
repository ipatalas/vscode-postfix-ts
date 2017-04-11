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

const LANGUAGE = 'postfix'

describe('Simple template tests', () => {
	afterEach(done => {
		vsc.commands.executeCommand('workbench.action.closeOtherEditors').then(() => done(), err => done(err))
	})

	it('let template - binary expression', testTemplate('a * 3', 'let', 'let name = a * 3'))
	it('let template - method call', testTemplate('obj.call()', 'let', 'let name = obj.call()'))
	it('let template - property access expression', testTemplate('obj.a.b', 'let', 'let name = obj.a.b'))
	it('let template - postifx unary operator', testTemplate('counter++', 'let', 'let name = counter++'))

	it('var template', testTemplate('a.b', 'var', 'var name = a.b'))
	it('const template', testTemplate('a.b', 'const', 'const name = a.b'))

	it('log template', testTemplate('expr', 'log', 'console.log(expr)', false))
	it('warn template', testTemplate('expr', 'warn', 'console.warn(expr)'))
	it('error template', testTemplate('expr', 'error', 'console.error(expr)'))

	it('return template', testTemplate('expr', 'return', 'return expr'))

	it('not template', testTemplate('expr', 'not', '!expr'))
	it('not template - binary expression', testTemplate('x * 100', 'not', '!(x * 100)'))
	it('not template - inside an if', testTemplate('if (x * 100{cursor})', 'not', 'if(!(x*100))', true))
	it('not template - complex conditions - first expression', testTemplateWithOptions('if (a > b && x * 100{cursor})', 'not', 'if(a>b&&!(x*100))', true, 0))
	it('not template - complex conditions - second expression', testTemplateWithOptions('if (a > b && x * 100{cursor})', 'not', 'if(!(a>b&&x*100))', true, 1))
	it('not template - complex conditions - cancel quick pick', testTemplateWithOptions('if (a > b && x * 100{cursor})', 'not', 'if(a>b&&x*100.)', true, 0, true))
	it('not template - already negated expression', testTemplate('!expr', 'not', 'expr'))
	it('not template - already negated expression - method call', testTemplate('!x.method()', 'not', 'x.method()'))

	it('if template', testTemplate('expr', 'if', 'if(expr){}', true))
	it('else template', testTemplate('expr', 'else', 'if(!expr){}', true))
	it('else template - binary expression', testTemplate('x * 100', 'else', 'if(!(x*100)){}', true))

	it('null template', testTemplate('expr', 'null', 'if(expr===null){}', true, 1))
	it('notnull template', testTemplate('expr', 'notnull', 'if(expr!==null){}', true))
	it('undefined template', testTemplate('expr', 'undefined', 'if(expr===undefined){}', true))
	it('notundefined template', testTemplate('expr', 'notundefined', 'if(expr!==undefined){}', true))

	it('forof template', testTemplate('expr', 'forof', 'for(letitemofexpr){}', true))
	it('foreach template', testTemplate('expr', 'foreach', 'expr.forEach(item=>)', true, 1))
})

function testTemplate (initialText: string, template: string, expectedResult: string, trimWhitespaces?: boolean, skipSuggestions: number = 0) {
	return (done: MochaDone) => {
		vsc.workspace.openTextDocument({ language: LANGUAGE }).then((doc) => {
			return selectAndAcceptSuggestion(
				doc, initialText, template, skipSuggestions
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

function selectAndAcceptSuggestion (doc: vsc.TextDocument, initialText: string, template: string, skipSuggestions: number = 0) {
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
	})
}

function assertText (doc: vsc.TextDocument, expectedResult: string, trimWhitespaces: boolean) {
	let result = doc.getText()

	if (trimWhitespaces) {
		result = result.replace(/\s/g, '')
	}

	assert.equal(result, expectedResult)
}

function delay (timeout) {
	return new Promise<void>(resolve => {
		setTimeout(resolve, timeout)
	})
}

// for some reason editor.action.triggerSuggest needs more delay at the beginning when the process is not yet warmed up
// let's start from high delays and then slowly go to lower delays
let delaySteps = [2000, 1200, 700, 400, 300, 200, 100]

const getCurrentDelay = () => (delaySteps.length > 1) ? delaySteps.shift() : delaySteps[0]
