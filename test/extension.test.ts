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

suite('Templates Tests', () => {
	test('var template', (done) => {
		vsc.workspace.openTextDocument({ language: 'typescript' }).then((doc) => {
			let template = new VarTemplate('var')
			let item = template.buildCompletionItem('a * 3.', new vsc.Position(0, 6))

			return vsc.window.showTextDocument(doc).then(() => {
				return vsc.window.activeTextEditor.edit(edit => {
					edit.insert(new vsc.Position(0, 0), 'a * 3.')
				})
			}).then(() => {
				return vsc.window.activeTextEditor.insertSnippet(item.insertText as vsc.SnippetString, item.range)
			}).then(() => {
				let result = doc.getText()
				try {
					assert.equal(result, 'var name = a * 3')
					done()
				} catch (err) {
					done(err)
				}
			})
		})
	})
})
