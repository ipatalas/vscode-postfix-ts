import * as ts from 'typescript'
import * as vsc from 'vscode'

export const AllTabs = /^\t+$/
export const AllSpaces = /^ +$/

export const getIndentCharacters = () => {
  if (vsc.window.activeTextEditor.options.insertSpaces) {
    return ' '.repeat(vsc.window.activeTextEditor.options.tabSize as number)
  } else {
    return '\t'
  }
}

const operatorMapping = new Map<ts.SyntaxKind, ts.SyntaxKind>([
  [ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken],
  [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken],
  [ts.SyntaxKind.GreaterThanEqualsToken, ts.SyntaxKind.LessThanToken],
  [ts.SyntaxKind.GreaterThanToken, ts.SyntaxKind.LessThanEqualsToken]
])

const reverseMapping = new Map<ts.SyntaxKind, ts.SyntaxKind>()
operatorMapping.forEach((v, k) => reverseMapping.set(v, k))

const logicalOperatorMapping = new Map<ts.SyntaxKind, ts.SyntaxKind>([
  [ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken],
  [ts.SyntaxKind.BarBarToken, ts.SyntaxKind.AmpersandAmpersandToken]
])

export const invertBinaryExpression = (expr: ts.BinaryExpression, addOrBrackets: boolean = false): string => {
  let op = operatorMapping.get(expr.operatorToken.kind) || reverseMapping.get(expr.operatorToken.kind)
  if (op) {
    return `${expr.left.getText()} ${ts.tokenToString(op)} ${expr.right.getText()}`
  }

  op = logicalOperatorMapping.get(expr.operatorToken.kind)
  if (op) {
    let left = invertExpression(expr.left, op !== ts.SyntaxKind.BarBarToken)
    let right = invertExpression(expr.right, op !== ts.SyntaxKind.BarBarToken)
    let result = `${left} ${ts.tokenToString(op)} ${right}`

    return addOrBrackets && op === ts.SyntaxKind.BarBarToken ? `(${result})` : result
  }
}

export const invertExpression = (expr: ts.Node, addOrBrackets: boolean = false, indentSize?: number) => {
  let text = adjustMultilineIndentation(expr.getText(), indentSize)

  if (expr.kind === ts.SyntaxKind.BinaryExpression) {
    let result = invertBinaryExpression(expr as ts.BinaryExpression, addOrBrackets)
    if (result) {
      return result
    }

    return text.startsWith('!') ? text.substr(1) : `!(${text})`
  }

  return text.startsWith('!') ? text.substr(1) : `!${text}`
}

export function adjustMultilineIndentation(code: string, indentSize?: number) {
  if (!indentSize) {
    return code
  }

  const reNewLine = /\r?\n/
  const lines = code.split(reNewLine)

  if (lines.length === 1) {
    return code
  }

  const newLine = reNewLine.exec(code)[0]

  return lines.map((line, i) => i > 0 ? stripLineIndent(line, indentSize) : line)
    .join(newLine)
}

function stripLineIndent(line: string, indentSize: number) {
  const whitespacesMatch = /^[\t ]+/.exec(line)
  if (!whitespacesMatch) {
    return line
  }

  const whitespaces = whitespacesMatch[0]

  if (AllTabs.test(whitespaces) && indentSize <= whitespaces.length) {
    return line.substring(indentSize)
  }

  const tabSize = vsc.window.activeTextEditor.options.tabSize as number

  if (AllSpaces.test(whitespaces) && indentSize <= (whitespaces.length / tabSize)) {
    return line.substring(indentSize * tabSize)
  }

  return line
}
