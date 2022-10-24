import * as assert from 'assert'
import * as vsc from 'vscode'
import * as ts from 'typescript'
import { describe, it } from 'mocha'

import { getIndentCharacters } from '../src/utils'
import { invertBinaryExpression, invertExpression } from '../src/utils/invert-expression'

describe('Utils tests', () => {
  it('getIndentCharacters when spaces', () => {
    vsc.window.activeTextEditor.options.insertSpaces = true
    vsc.window.activeTextEditor.options.tabSize = 4

    const result = getIndentCharacters()
    assert.strictEqual(result, '    ')
  })

  it('getIndentCharacters when tabs', () => {
    vsc.window.activeTextEditor.options.insertSpaces = false

    const result = getIndentCharacters()
    assert.strictEqual(result, '\t')
  })

  describe('invertExpression', () => {
    testInvertExpression('x             >>  !x')
    testInvertExpression('!x            >>  x')
    testInvertExpression('x * 100       >>  !(x * 100)')
    testInvertExpression('!(x * 100)    >>  x * 100')
    testInvertExpression('x && y * 100  >>  !x || !(y * 100)')
    testInvertExpression('(x > y)       >>  (x <= y)')
  })

  describe('invertBinaryExpression', () => {

    describe('operators', () => {
      testInvertBinaryExpression('x > y    >>  x <= y')
      testInvertBinaryExpression('x < y    >>  x >= y')
      testInvertBinaryExpression('x >= y   >>  x < y')
      testInvertBinaryExpression('x <= y   >>  x > y')
      testInvertBinaryExpression('x == y   >>  x != y')
      testInvertBinaryExpression('x === y  >>  x !== y')
      testInvertBinaryExpression('x != y   >>  x == y')
      testInvertBinaryExpression('x !== y  >>  x === y')
    })

    describe('complex expressions', () => {
      testInvertBinaryExpression('x > y && a                 >>  x <= y || !a')
      testInvertBinaryExpression('x && a == b                >>  !x || a != b')
      testInvertBinaryExpression('x && y                     >>  !x || !y')
      testInvertBinaryExpression('!x && !y                   >>  x || y')
      testInvertBinaryExpression('x > y && a >= b            >>  x <= y || a < b')
      testInvertBinaryExpression('x > y || a >= b            >>  x <= y && a < b')
      testInvertBinaryExpression('x > y && a >= b || c == d  >>  (x <= y || a < b) && c != d')
      testInvertBinaryExpression('x || y && z                >>  !x && (!y || !z)')
      testInvertBinaryExpression('a && b && c                >>  !a || !b || !c')
      testInvertBinaryExpression('a && b && c && d           >>  !a || !b || !c || !d')
      testInvertBinaryExpression('a || b && c && d           >>  !a && (!b || !c || !d)')
      testInvertBinaryExpression('a && b || c && d           >>  (!a || !b) && (!c || !d)')
      testInvertBinaryExpression('!(a && b) || !(c && d)     >>  a && b && c && d')
    })
  })
})

function testInvertBinaryExpression(dsl: string) {
  const [input, expected] = dsl.split('>>').map(x => x.trim())

  it(`${input} should invert to ${expected}`, () => {
    const source = ts.createSourceFile('invertBinaryExpression.ts', input, ts.ScriptTarget.ES5, true)
    const expr = (source.statements[0] as ts.ExpressionStatement).expression as ts.BinaryExpression

    const result = invertBinaryExpression(expr)

    assert.strictEqual(result, expected)
  })
}

function testInvertExpression(dsl: string) {
  const [input, expected] = dsl.split('>>').map(x => x.trim())

  it(`${input} should invert to ${expected}`, () => {
    const source = ts.createSourceFile('invertBinaryExpression.ts', input, ts.ScriptTarget.ES5, true)
    const expr = (source.statements[0] as ts.ExpressionStatement).expression

    const result = invertExpression(expr)

    assert.strictEqual(result, expected)
  })
}
