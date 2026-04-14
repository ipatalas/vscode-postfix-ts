import * as vsc from 'vscode'
import * as assert from 'assert'
import { sortBy } from 'lodash'
import { TestFunction, it } from 'mocha'
import { parseDSL, ITestDSL } from './dsl'
import { EOL } from 'node:os'
import { SnippetParser } from 'vscode-snippet-parser'

const LANGUAGE = 'postfix'

const config = vsc.workspace.getConfiguration('editor', null)
export const TabSize = config.get<number>('tabSize') ?? 4

export function delay(timeout: number) {
  return new Promise<void>(resolve => setTimeout(resolve, timeout))
}

export type TestTemplateOptions = Partial<{
  trimWhitespaces: boolean
  preAssertAction: () => Thenable<void>
  fileContext: string
  fileLanguage: string
  useCommandForCompletion: boolean
}>

export function testTemplate(dslString: string, options: TestTemplateOptions = {}) {
  const dsl = parseDSL(dslString, options.useCommandForCompletion)

  return (done: Mocha.Done) => {
    vsc.workspace.openTextDocument({ language: options.fileLanguage ?? LANGUAGE }).then(async (doc) => {
      try {
        await selectAndAcceptSuggestion(doc, dsl, options.fileContext)
        await options.preAssertAction?.()

        const expected = options.fileContext
          ? options.fileContext.trim().replace('{{CODE}}', dsl.expected)
          : dsl.expected

        assertText(doc, expected, options.trimWhitespaces)
        await vsc.commands.executeCommand('workbench.action.closeActiveEditor')
        done()
      } catch (reason) {
        await vsc.commands.executeCommand('workbench.action.closeActiveEditor')
        done(reason)
      }
    })
  }
}

export function testTemplateWithQuickPick(dslString: string, trimWhitespaces?: boolean, skipSuggestions = 0, cancelQuickPick = false) {
  return testTemplate(dslString, {
    trimWhitespaces, preAssertAction: async () => {
      if (cancelQuickPick) {
        await vsc.commands.executeCommand('workbench.action.closeQuickOpen')
      } else {
        await delay(50)

        for (let i = 0; i < skipSuggestions; i++) {
          await vsc.commands.executeCommand('workbench.action.quickOpenSelectNext')
        }

        await vsc.commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem')
      }

      await delay(50)
    }
  })
}

async function selectAndAcceptSuggestion(doc: vsc.TextDocument, dsl: ITestDSL, fileContext?: string) {
  const editor = await vsc.window.showTextDocument(doc, vsc.ViewColumn.One)

  let startPosition = new vsc.Position(0, 0)

  if (fileContext) {
    fileContext = fileContext.trim()
    const [before, after] = fileContext.split('{{CODE}}')
    await editor.edit(edit => {
      edit.insert(new vsc.Position(0, 0), before ?? '')
    })
    startPosition = editor.selection.start
    await editor.edit(edit => {
      edit.insert(startPosition, after ?? '')
    })
  }

  if (await editor.edit(edit => {
    edit.insert(startPosition, dsl.input)
  })) {
    const { character, line } = dsl.cursorPosition
    const pos = startPosition.translate(line, character)

    editor.selection = new vsc.Selection(pos, pos)

    if (dsl.useCommandForCompletion) {
      await vsc.commands.executeCommand('postfix.template', dsl.template)
      // awaiting command only awaits for when it's sent so need to wait for actual document change
      await waitForDocumentChange(doc, 2)
      return
    }

    const completions = await vsc.commands.executeCommand<vsc.CompletionList>('vscode.executeCompletionItemProvider', doc.uri, pos)
    const sortedItems = sortBy(completions.items, ({ sortText }) => sortText)

    const completion = sortedItems.find(({ label }) => (typeof label === 'object' ? label.label : label) === dsl.template)
    if (!completion) {
      throw new Error(`Completion not found: ${dsl.template}`)
    }
    const range = (completion.range as { inserting: vsc.Range; replacing: vsc.Range }).replacing
    // Always use TextEdit (not SnippetTextEdit) so that workspace.applyEdit does not
    // run VSCode's snippet auto-indentation pass, which would prepend the current
    // line's indentation to every newline inside the snippet — doubling the tabs
    // that adjustLeadingWhitespace already baked into the text.
    // Tab-stop defaults are expanded via SnippetParser so the inserted text is correct.
    const insertText = completion.insertText instanceof vsc.SnippetString
      ? new SnippetParser().text(completion.insertText.value)
      : completion.insertText ?? ''
    const mainEdit = vsc.TextEdit.replace(range, insertText)

    const edits = [...completion.additionalTextEdits ?? [], mainEdit]
    const edit = new vsc.WorkspaceEdit()
    edit.set(doc.uri, edits)
    await vsc.workspace.applyEdit(edit)

    if (completion.command) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await vsc.commands.executeCommand(completion.command.command, ...(completion.command.arguments ?? []))
    }
  }
}

function waitForDocumentChange(doc: vsc.TextDocument, expectedEdits = 1) {
  let edits = 0
  // const now = Date.now()
  return new Promise<void>(resolve => {
    const disposable = vsc.workspace.onDidChangeTextDocument(e => {
      if (e.document.uri.toString() === doc.uri.toString()) {
        edits++
        // console.log(`Document change detected at ${Date.now() - now}ms, edits: ${edits}`)
        if (edits >= expectedEdits) {
          disposable.dispose()
          resolve()
        }
      }
    })

    // Fallback in case onDidChangeTextDocument is not fired
    setTimeout(() => {
      // console.log(`Timeout reached after ${Date.now() - now}ms, edits detected: ${edits}`)
      disposable.dispose()
      resolve()
    }, 100)
  })
}

function assertText(doc: vsc.TextDocument, expectedResult: string, trimWhitespaces = false) {
  let result = doc.getText()

  if (trimWhitespaces) {
    result = result.replaceAll(/\s/g, '')
    expectedResult = expectedResult.replaceAll(/\s/g, '')
  }

  assert.strictEqual(normalizeWhitespaces(result), normalizeWhitespaces(expectedResult))
}

function normalizeWhitespaces(text: string) {
  return text
    .split(/\r?\n/g)
    .map(line => line.replace(/\t/g, ' '.repeat(TabSize)))
    .join(EOL)
}

type Tail<T extends unknown[]> = T extends [unknown, ...infer R] ? R : never
type TestArgs<F extends (test: TestFunction, ...args: never[]) => unknown> =
  Tail<Parameters<F>>

interface WrappedTestFunction<F extends (test: TestFunction, ...args: never[]) => unknown> {
  (...args: TestArgs<F>): void
  only(...args: TestArgs<F>): void
  skip(...args: TestArgs<F>): void
}

export function makeTestFunction<F extends (test: TestFunction, ...args: never[]) => unknown>(
  fn: F
): WrappedTestFunction<F> {
  const wrap =
    (variant: TestFunction) =>
      (...args: TestArgs<F>) =>
        fn(variant, ...args)

  const wrapper = wrap(it) as WrappedTestFunction<F>
  wrapper.only = wrap(it.only as unknown as TestFunction)
  wrapper.skip = wrap(it.skip as unknown as TestFunction)

  return wrapper
}
