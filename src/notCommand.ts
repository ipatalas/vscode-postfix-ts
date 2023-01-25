import * as vsc from 'vscode'
import * as ts from 'typescript'
import { invertExpression } from './utils/invert-expression'

export const NOT_COMMAND = '_postfix.applyNotTemplate'

export function notCommand(editor: vsc.TextEditor, expressions: ts.BinaryExpression[]) {
  return vsc.window.showQuickPick(expressions.map(node => ({
    label: node.getText().replace(/\s+/g, ' '),
    description: '',
    detail: 'Invert this expression',
    node
  })))
    .then(value => {
      if (!value) {
        return undefined
      }

      return editor.edit(e => {
        const node = value.node

        const src = node.getSourceFile()
        const nodeStart = ts.getLineAndCharacterOfPosition(src, node.getStart(src))
        const nodeEnd = ts.getLineAndCharacterOfPosition(src, node.getEnd())

        const range = new vsc.Range(
          new vsc.Position(nodeStart.line, nodeStart.character),
          new vsc.Position(nodeEnd.line, nodeEnd.character + 1) // accomodate 1 character for the dot
        )

        e.delete(range)
        e.insert(range.start, invertExpression(value.node))
      })
    })
}
