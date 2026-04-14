import { EOL } from 'os'

export function parseDSL(input: string, useCommandForCompletion = false): ITestDSL {
  const inputLines: string[] = []
  const expectedLines: string[] = []
  let template = ''
  let cursorLine = 0
  let cursorCharacter = 0

  const lines = input.split(/\r?\n/).filter(l => l.length > 0)

  for (let i = 0; i < lines.length; i++) {
    let [input, expected] = lines[i]?.split('>> ') as [string, string]
    input = input.trimEnd()

    const leadingMark = /^\s*\| /.exec(input)
    if (leadingMark !== null) {
      input = input.replace(leadingMark[0], '')
    }

    const match = /(?<!\$)\{(\w+)\}/.exec(input)
    if (match !== null) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      template = match[1]!

      input = input.replace(match[0], useCommandForCompletion ? '' : `.${template}`)

      const templateOffset = useCommandForCompletion ? 0 : template.length + 1

      cursorLine = i
      cursorCharacter = match.index + templateOffset
    }

    inputLines.push(...(input ? [input] : []))
    expectedLines.push(expected)
  }

  if (template.length === 0) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw new Error('DSL must contain template placeholder (ie. {let})')
  }

  return {
    input: inputLines.join(EOL),
    template: template,
    useCommandForCompletion: useCommandForCompletion,
    expected: expectedLines.join(EOL),
    cursorPosition: {
      line: cursorLine,
      character: cursorCharacter
    }
  } as ITestDSL
}

export interface ITestDSL {
  input: string,
  template: string,
  useCommandForCompletion: boolean,
  expected: string,
  cursorPosition: {
    line: number,
    character: number
  }
}
