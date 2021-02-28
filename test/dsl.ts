import { EOL } from 'os'

export function parseDSL(input: string) {
  const inputLines: string[] = []
  const expectedLines: string[] = []
  let template = ''
  let cursorLine = 0
  let cursorCharacter = 0

  const lines = input.split(/\r?\n/).filter(l => l.length > 0)

  for (let i = 0; i < lines.length; i++) {
    let [input, expected] = lines[i].split('>> ')
    input = input.trimRight()

    const leadingMark = /^\s*\| /.exec(input)
    if (leadingMark !== null) {
      input = input.replace(leadingMark[0], '')
    }

    const match = /\{(\w+)\}/.exec(input)
    if (match !== null) {
      template = match[1]
      input = input.replace(match[0], `.${template}`)

      cursorLine = i
      cursorCharacter = match.index + template.length + 1
    }

    inputLines.push(input)
    expectedLines.push(expected)
  }

  if (template.length === 0) {
    throw new Error('DSL must contain template placeholder (ie. {let})')
  }

  return {
    input: inputLines.join(EOL),
    template: template,
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
  expected: string,
  cursorPosition: {
    line: number,
    character: number
  }
}
