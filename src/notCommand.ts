import * as vsc from 'vscode'
import * as ts from 'typescript'
import { invertExpression } from './utils'

export const NOT_COMMAND = 'complete.notTemplate'

export function notCommand (editor: vsc.TextEditor, position: vsc.Position, suffix: string, expressions: ts.BinaryExpression[]) {
  vsc.window.showQuickPick(expressions.map(node => ({
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
        const expressionBody = value.node.getText()
        const startPos = new vsc.Position(position.line, position.character - expressionBody.length - suffix.length)
        const range = new vsc.Range(startPos, new vsc.Position(position.line, position.character - suffix.length + 1))

        e.replace(range, invertExpression(value.node))
      })
    })
}
