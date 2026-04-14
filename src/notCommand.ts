import * as vsc from 'vscode'
import * as ts from 'typescript'
import { invertExpression } from './utils/invert-expression'
import { TEMPLATE_COMMAND } from './templateCommand'

export const NOT_COMMAND = 'complete.notTemplate'
type NotCommandArgs = ts.BinaryExpression[] | [string, ts.BinaryExpression[]]

export function notCommand(editor: vsc.TextEditor, args: NotCommandArgs) {
  const isWrapped = (obj: NotCommandArgs): obj is [string, ts.BinaryExpression[]] => {
    return Array.isArray(obj) && obj.length > 0 && typeof obj[0] === 'string' && obj[0] === TEMPLATE_COMMAND
  }
  const calledFromTemplateCommand = isWrapped(args)
  const expressions = calledFromTemplateCommand ? args[1] : args

  vsc.window.showQuickPick(expressions.map(node => ({
    label: node.getText().replace(/\s+/g, ' '),
    description: '',
    detail: 'Invert this expression',
    node
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
          // accomodate 1 character for the dot if called from completion, but not from command
          new vsc.Position(nodeEnd.line, nodeEnd.character + (calledFromTemplateCommand ? 0 : 1))
        )

        e.delete(range)
        e.insert(range.start, invertExpression(value.node))
      })
    })
}
