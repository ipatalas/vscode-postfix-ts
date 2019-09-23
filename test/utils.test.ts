import * as assert from 'assert'
import * as vsc from 'vscode'
import * as ts from 'typescript'
import { getIndentCharacters, invertBinaryExpression, invertExpression } from '../src/utils'

describe('Utils tests', () => {
  it('getIndentCharacters when spaces', () => {
    vsc.window.activeTextEditor.options.insertSpaces = true
    vsc.window.activeTextEditor.options.tabSize = 4

    let result = getIndentCharacters()
    assert.strictEqual(result, '    ')
  })

  it('getIndentCharacters when tabs', () => {
    vsc.window.activeTextEditor.options.insertSpaces = false

    let result = getIndentCharacters()
    assert.strictEqual(result, '\t')
  })

  describe('invertExpression', () => {
    testInvertExpression('x', '!x')
    testInvertExpression('!x', 'x')
    testInvertExpression('x * 100', '!(x * 100)')
    testInvertExpression('x && y * 100', '!x || !(y * 100)')
  })

  describe('invertBinaryExpression', () => {

    describe('operators', () => {
      testInvertBinaryExpression('x > y', 'x <= y')
      testInvertBinaryExpression('x < y', 'x >= y')
      testInvertBinaryExpression('x >= y', 'x < y')
      testInvertBinaryExpression('x <= y', 'x > y')
      testInvertBinaryExpression('x == y', 'x != y')
      testInvertBinaryExpression('x === y', 'x !== y')
      testInvertBinaryExpression('x != y', 'x == y')
      testInvertBinaryExpression('x !== y', 'x === y')
    })

    describe('complex expressions', () => {
      testInvertBinaryExpression('x > y && a', 'x <= y || !a')
      testInvertBinaryExpression('x && a == b', '!x || a != b')
      testInvertBinaryExpression('x && y', '!x || !y')
      testInvertBinaryExpression('!x && !y', 'x || y')
      testInvertBinaryExpression('x > y && a >= b', 'x <= y || a < b')
      testInvertBinaryExpression('x > y || a >= b', 'x <= y && a < b')
      testInvertBinaryExpression('x > y && a >= b || c == d', '(x <= y || a < b) && c != d')
      testInvertBinaryExpression('x || y && z', '!x && (!y || !z)')
      testInvertBinaryExpression('a && b && c', '!a || !b || !c')
      testInvertBinaryExpression('a && b && c && d', '!a || !b || !c || !d')
      testInvertBinaryExpression('a || b && c && d', '!a && (!b || !c || !d)')
      testInvertBinaryExpression('a && b || c && d', '(!a || !b) && (!c || !d)')
    })
  })
})

function testInvertBinaryExpression (input: string, expected: string) {
  it(`${input} should invert to ${expected}`, () => {
    let source = ts.createSourceFile('invertBinaryExpression.ts', input, ts.ScriptTarget.ES5, true)
    let expr = (source.statements[0] as ts.ExpressionStatement).expression as ts.BinaryExpression

    let result = invertBinaryExpression(expr)

    assert.strictEqual(result, expected)
  })
}

function testInvertExpression (input: string, expected: string) {
  it(`${input} should invert to ${expected}`, () => {
    let source = ts.createSourceFile('invertBinaryExpression.ts', input, ts.ScriptTarget.ES5, true)
    let expr = (source.statements[0] as ts.ExpressionStatement).expression

    let result = invertExpression(expr)

    assert.strictEqual(result, expected)
  })
}
