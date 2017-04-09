import * as assert from 'assert'
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vsc from 'vscode'
import { getIndentCharacters } from '../src/utils'

suite('Utils tests', () => {
	test('getIndentCharacters when spaces', () => {
		vsc.window.activeTextEditor.options.insertSpaces = true
		vsc.window.activeTextEditor.options.tabSize = 4

		let result = getIndentCharacters()
		assert.equal(result, '    ')
	})

	test('getIndentCharacters when tabs', () => {
		vsc.window.activeTextEditor.options.insertSpaces = false

		let result = getIndentCharacters()
		assert.equal(result, '\t')
	})
})
