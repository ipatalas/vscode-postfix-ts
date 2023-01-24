import * as vsc from 'vscode'
import { Options, runTest } from './runner'
import { describe, before, after } from 'mocha'
import { runWithCustomTemplate } from './utils'

const config = vsc.workspace.getConfiguration('postfix')
const withTrimWhitespaces: Options = { trimWhitespaces: true }
const html: Options = {
  fileLanguage: 'html',
  fileContext: `
<script>
  let name = 'world';
  {{CODE}}
</script>
<h1>Hello {name}!</h1>`,
  extraDelay: 1500
}

const Test = (test: string, options?: Pick<Options, 'trimWhitespaces'>) => runTest(test, { ...html, ...options })

describe('HTML/Svelte/Vue - smoke tests', () => {
  before(setInferVarName(config, false))
  after(setInferVarName(config, true))

  Test('log template    | expr{log}     >> console.log(expr)')

  Test('return template | expr{return}  >> return expr')
  Test('return template | x > 1{return} >> return x > 1')
  Test('return template | x > y{return} >> return x > y')

  Test('if template           | expr{if}      >> if(expr){}', withTrimWhitespaces)
  Test('else template         | expr{else}    >> if(!expr){}', withTrimWhitespaces)

  Test('let template - binary expression #1       | a * 3{let}               >> let name = a * 3')
  Test('let template - method call                | obj.call(){let}          >> let name = obj.call()')
  Test('let template - property access expression | obj.a.b{let}             >> let name = obj.a.b')
  Test('let template - new expression             | new Type(1, 2, 3){let}   >> let name = new Type(1, 2, 3)')
  Test('let template - string literal #1          | "a string"{let}          >> let name = "a string"')
  Test('let template - escape characters          | `\\\\\\\\`{let}          >> let name = `\\\\\\\\`')

  Test('null template         | expr{null}         >> if(expr===null){}', withTrimWhitespaces)
  Test('notnull template      | expr{notnull}      >> if(expr!==null){}', withTrimWhitespaces)
  Test('undefined template    | expr{undefined}    >> if(expr===undefined){}', withTrimWhitespaces)
  Test('notundefined template | expr{notundefined} >> if(expr!==undefined){}', withTrimWhitespaces)

  Test('for template     | expr{for}           >> for(leti=0;i<expr.length;i++){}', withTrimWhitespaces)
  Test('awaited for      | await expr{for}     >> for(leti=0;i<(awaitexpr).length;i++){}', withTrimWhitespaces)
  Test('forof template   | expr{forof}         >> for(constitemofexpr){}', withTrimWhitespaces)
  Test('foreach template | expr{foreach}       >> expr.forEach(item=>)', withTrimWhitespaces)
  Test('awaited foreach  | await expr{foreach} >> (await expr).forEach(item => )')

  Test('cast template   | expr{cast}   >> (<>expr)')
  Test('castas template | expr{castas} >> (expr as )')

  Test('new template - identifier                 | Type{new}           >> new Type()')
  Test('new template - property access expression | namespace.Type{new} >> new namespace.Type()')

  Test('not template | expr{not} >> !expr')

  Test('promisify template - boolean       | const x:boolean{promisify} >> const x:Promise<boolean>')

  describe('Infer variable name', () => {
    before(setInferVarName(config, true))
    after(setInferVarName(config, false))

    Test('let template with name - new expression  | new Type(1, 2, 3){let}              >> let type = new Type(1, 2, 3)')
    Test('let template with name - call expression | getSomethingCool(1, 2, 3){let}      >> let somethingCool = getSomethingCool(1, 2, 3)')
    Test('forof template with array item name #1   | usersList{forof}                    >> for(constuserofusersList){}', withTrimWhitespaces)
  })

  describe('custom template tests', () => {
    const run = runWithCustomTemplate('!{{expr}}')

    run('identifier', 'expr{custom}           | expr{custom}        >> !expr')
    run('string-literal', 'expr{custom}       | "expr"{custom}      >> !"expr"')
    run('expression',
      '  expr.test{custom}                    | expr.test{custom}   >> !expr.test',
      '  expr[index]{custom}                  | expr[index]{custom} >> !expr[index]')
    run('binary-expression',
      'x > 100{custom}                        | x > 100{custom}     >> !x > 100',
      'x > y{custom}                          | x > y{custom}       >> !x > y')
    run('unary-expression', ' !x{custom}      | !x{custom}          >> !!x')
    run('function-call',
      '  call(){custom}                       | call(){custom}      >> !call()',
      '  test.call(){custom}                  | test.call(){custom} >> !test.call()')
    run('new-expression', 'new Type(){custom} | new Type(){custom}  >> !new Type()')
    run('type',
      '  const x:boolean{custom}              | const x:boolean{custom}       >> const x:!boolean',
      '  const x:A.B{custom}                  | const x:A.B{custom}           >> const x:!A.B',
      '  const arrow=():string{custom}        | const arrow=():string{custom} >> const arrow=():!string',
      '  function f():boolean{custom}         | function f():boolean{custom}  >> function f():!boolean',
      '  function f():A.B{custom}             | function f():A.B{custom}      >> function f():!A.B',
      '  function f():A.B.C.D{custom}         | function f():A.B.C.D{custom}  >> function f():!A.B.C.D')
  })
})

function setInferVarName(config: vsc.WorkspaceConfiguration, value: boolean) {
  return (done: Mocha.Done) => {
    config.update('inferVariableName', value, true).then(done, done)
  }
}
