import * as vsc from 'vscode'
import * as ts from 'typescript'
import { invertExpression } from './utils/invert-expression'

export const NOT_COMMAND = 'complete.notTemplate'

export function notCommand(editor: vsc.TextEditor, expressions: ts.BinaryExpression[]) {
  return vsc.window.showQuickPick(expressions.map(node => ({
    label: node.getText(),
    description: '',
    detail: 'Invert this expression',
    node: node
  })))
    .then(value => {
      if (!value) {
        return undefined
      }

      editor.edit(e => {
        const node = value.node

        const src = node.getSourceFile()
        const nodeStart = ts.getLineAndCharacterOfPosition(src, node.getStart(src))
        const nodeEnd = ts.getLineAndCharacterOfPosition(src, node.getEnd())

        const range = new vsc.Range(
          new vsc.Position(nodeStart.line, nodeStart.character),
          new vsc.Position(nodeEnd.line, nodeEnd.character + 1) // accomodate 1 character for the dot
        )

        e.replace(range, invertExpression(value.node))
      })
    })
}
