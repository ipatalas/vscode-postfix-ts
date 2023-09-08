import * as vsc from 'vscode'
import { runTest as Test, runTestQuickPick as QuickPick, Options } from './runner'
import { describe, before, after } from 'mocha'
import { runWithCustomTemplate } from './utils'

const config = vsc.workspace.getConfiguration('postfix')
const withTrimWhitespaces: Options = { trimWhitespaces: true }

describe('Single line template tests', () => {
  before(setInferVarName(config, false))
  after(setInferVarName(config, true))

  Test('not template - already negated expression | !expr{not}               >> expr')
  Test('let template - binary expression #1       | a * 3{let}               >> let name = a * 3')
  Test('let template - binary expression #2       | a * b{let}               >> let name = a * b')
  Test('let template - binary expression - nested | x && a * b{let}          >> let name = x && a * b')
  Test('let template - non-null as assertion      | test!{let}               >> let name = test!')
  Test('let template - method call                | obj.call(){let}          >> let name = obj.call()')
  Test('let template - method call with non-null  | obj.call()!{let}         >> let name = obj.call()!')
  Test('let template - property access expression | obj.a.b{let}             >> let name = obj.a.b')
  Test('let template - property access expression!| obj.a.b!{let}            >> let name = obj.a.b!')
  Test('let template - element access expression  | obj.a[b]{let}            >> let name = obj.a[b]')
  Test('let template - postifx unary operator     | counter++{let}           >> let name = counter++')
  Test('let template - new expression             | new Type(1, 2, 3){let}   >> let name = new Type(1, 2, 3)')
  Test('let template - new expression !           | new Type(1, 2, 3)!{let}  >> let name = new Type(1, 2, 3)!')
  Test('let template - awaited expression         | await expr{let}          >> let name = await expr')
  Test('let template - escape dollar sign         | $expr.$a{let}            >> let name = $expr.$a')
  Test('let template - string literal #1          | "a string"{let}          >> let name = "a string"')
  Test('let template - string literal #2          | \'a string\'{let}        >> let name = \'a string\'')
  Test('let template - string literal #3          | `a string`{let}          >> let name = `a string`')
  Test('let template - string literal #4          | `a ${value} string`{let} >> let name = `a ${value} string`')
  Test('let template - string literal #5          | `a string ${value}`{let} >> let name = `a string ${value}`')
  Test('let template - escape characters          | `\\\\\\\\`{let}          >> let name = `\\\\\\\\`')

  Test('var template          | a.b{var}   >> var name = a.b')
  Test('var template (indent) | \ta.b{var} >> \tvar name = a.b')
  Test('const template        | a.b{const} >> const name = a.b')

  Test('log template          | expr{log}   >> console.log(expr)')
  Test('warn template         | expr{warn}  >> console.warn(expr)')
  Test('error template        | expr{error} >> console.error(expr)')
  Test('log template - binary | x > y{log}  >> console.log(x > y)')

  Test('log template - obj literal (empty) | {}{log}          >> console.log({})')
  Test('log template - obj literal         | {foo:"foo"}{log} >> console.log({foo:"foo"})')

  Test('return template | expr{return}       >> return expr')
  Test('return template | x > 1{return}      >> return x > 1')
  Test('return template | x > y{return}      >> return x > y')
  Test('return template | new Type(){return} >> return new Type()')
  Test('return template | `\\\\\\\\`{return} >> return `\\\\\\\\`')

  Test('if template                       | expr{if}      >> if(expr){}', withTrimWhitespaces)
  Test('if template - binary expression   | a > b{if}     >> if(a>b){}', withTrimWhitespaces)
  Test('if template - binary in parens    | (a > b){if}   >> if(a>b){}', withTrimWhitespaces)
  Test('else template                     | expr{else}    >> if(!expr){}', withTrimWhitespaces)
  Test('else template - binary expression | x * 100{else} >> if(!(x*100)){}', withTrimWhitespaces)
  Test('else template - binary expression | a > b{else}   >> if(a<=b){}', withTrimWhitespaces)
  Test('else template - binary in parens  | (a > b){else} >> if(a<=b){}', withTrimWhitespaces)

  Test('null template         | expr{null}         >> if(expr===null){}', withTrimWhitespaces)
  Test('notnull template      | expr{notnull}      >> if(expr!==null){}', withTrimWhitespaces)
  Test('undefined template    | expr{undefined}    >> if(expr===undefined){}', withTrimWhitespaces)
  Test('notundefined template | expr{notundefined} >> if(expr!==undefined){}', withTrimWhitespaces)

  Test('null template         - inside if | if (x & expr{null})         >> if(x&expr===null)', withTrimWhitespaces)
  Test('notnull template      - inside if | if (x & expr{notnull})      >> if(x&expr!==null)', withTrimWhitespaces)
  Test('undefined template    - inside if | if (x & expr{undefined})    >> if(x&expr===undefined)', withTrimWhitespaces)
  Test('notundefined template - inside if | if (x & expr{notundefined}) >> if(x&expr!==undefined)', withTrimWhitespaces)

  Test('for template     | expr{for}           >> for(leti=0;i<expr.length;i++){}', withTrimWhitespaces)
  Test('awaited for      | await expr{for}     >> for(leti=0;i<(awaitexpr).length;i++){}', withTrimWhitespaces)
  Test('forof template   | expr{forof}         >> for(constitemofexpr){}', withTrimWhitespaces)
  Test('forin template   | expr{forin}         >> for(constkeyinexpr){}', withTrimWhitespaces)
  Test('foreach template | expr{foreach}       >> expr.forEach(item=>)', withTrimWhitespaces)
  Test('awaited foreach  | await expr{foreach} >> (await expr).forEach(item => )')

  Test('cast template   | expr{cast}   >> (<>expr)')
  Test('castas template | expr{castas} >> (expr as )')
  Test('call template   | expr{call}   >> (expr)')

  Test('new template - identifier                   | Type{new}           >> new Type()')
  Test('new template - property access expression   | namespace.Type{new} >> new namespace.Type()')
  Test('new template - assignment binary expression | a = B{new}          >> a = new B()')

  Test('not template                                            | expr{not}                   >> !expr')
  Test('not template - strict equality                          | if (a === b{not})           >> if (a !== b)')
  Test('not template - instanceof                               | if (a instanceof b{not})    >> if (!(a instanceof b))')
  Test('not template - ??=                                      | a ??= b{not}                >> a ??= !b')
  Test('not template - with non-null assertion                  | expr!{not}                  >> !expr!')
  Test('not template - inside a call expression                 | call.expression(expr{not})  >> call.expression(!expr)')
  Test('not template - inside a call expression - negated       | call.expression(!expr{not}) >> call.expression(expr)')
  Test('not template - binary expression                        | x * 100{not}                >> !(x * 100)')
  Test('not template - inside an if - identifier                | if (expr{not})              >> if(!expr)', withTrimWhitespaces)
  Test('not template - inside an if - binary                    | if (x * 100{not})           >> if(!(x*100))', withTrimWhitespaces)
  Test('not template - inside an if - brackets                  | if ((x * 100){not})         >> if(!(x*100))', withTrimWhitespaces)
  Test('not template - already negated expression - method call | !x.method(){not}            >> x.method()')

  Test('promisify template - boolean       | const x:boolean{promisify} >> const x:Promise<boolean>')
  Test('promisify template - string        | const x:string{promisify}  >> const x:Promise<string>')
  Test('promisify template - custom type   | const x:A.B{promisify}     >> const x:Promise<A.B>')
  Test('promisify template - custom type 2 | const x:A.B.C.D{promisify} >> const x:Promise<A.B.C.D>')

  Test('await template - expression                 | expr{await}       >> await expr')
  Test('await template - method call                | obj.call(){await} >> await obj.call()')
  Test('await template - property access expression | obj.a.b{await}    >> await obj.a.b')

  QuickPick('not template - complex conditions - first expression               | if (a > b && x * 100{not})    >> if(a>b&&!(x*100))', true, 0)
  QuickPick('not template - complex conditions - second expression              | if (a > b && x * 100{not})    >> if(a<=b||!(x*100))', true, 1)
  QuickPick('not template - complex conditions with parens - first expression   | if (a > b && (x * 100){not})  >> if(a>b&&!(x*100))', true, 0)
  QuickPick('not template - complex conditions with parens - second expression  | if (a > b && (x * 100){not})  >> if(a<=b||!(x*100))', true, 1)
  QuickPick('not template - complex conditions - cancel quick pick              | if (a > b && x * 100{not})    >> if(a>b&&x*100.)', true, 0, true)
  QuickPick('not template - complex conditions - first expression - alt         | if (a > b && x * 100{not})    >> if(a>b&&!(x*100))', true, 0)
  QuickPick('not template - complex conditions - second expression - alt        | if (a > b && x * 100{not})    >> if(a<=b||!(x*100))', true, 1)
  QuickPick('not template - complex conditions - cancel quick pick - alt        | if (a > b && x * 100{not})    >> if(a>b&&x*100.)', true, 0, true)

  describe('undefined templates in `typeof` mode', () => {
    before(setUndefinedMode(config, 'Typeof'))
    after(setUndefinedMode(config, undefined))

    Test('undefined template    | expr{undefined}    >> if(typeofexpr==="undefined"){}', withTrimWhitespaces)
    Test('notundefined template | expr{notundefined} >> if(typeofexpr!=="undefined"){}', withTrimWhitespaces)

    Test('undefined template    - inside if | if (x & expr{undefined})    >> if(x&typeofexpr==="undefined")', withTrimWhitespaces)
    Test('notundefined template - inside if | if (x & expr{notundefined}) >> if(x&typeofexpr!=="undefined")', withTrimWhitespaces)
  })

  describe('Infer variable name', () => {
    before(setInferVarName(config, true))
    after(setInferVarName(config, false))

    Test('let template with name - new expression  | new Type(1, 2, 3){let}              >> let type = new Type(1, 2, 3)')
    Test('let template with name - new expression  | new namespace.Type(1, 2, 3){let}    >> let type = new namespace.Type(1, 2, 3)')
    Test('let template with name - call expression | getSomethingCool(1, 2, 3){let}      >> let somethingCool = getSomethingCool(1, 2, 3)')
    Test('let template with name - call expression | this.getSomethingCool(1, 2, 3){let} >> let somethingCool = this.getSomethingCool(1, 2, 3)')
    Test('forof template with array item name #1   | usersList{forof}                    >> for(constuserofusersList){}', withTrimWhitespaces)
    Test('forof template with array item name #2   | cookies{forof}                      >> for(constcookieofcookies){}', withTrimWhitespaces)
    Test('forof template with array item name #3   | order.items{forof}                  >> for(constitemoforder.items){}', withTrimWhitespaces)
    Test('forof template with array item name #4   | object.getCommands(){forof}         >> for(constcommandofobject.getCommands()){}', withTrimWhitespaces)
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
      '  const x:boolean{custom}              | const x:boolean{custom}             >> const x:!boolean',
      '  const x:A.B{custom}                  | const x:A.B{custom}                 >> const x:!A.B',
      '  const arrow=():string{custom}        | const arrow=():string{custom}       >> const arrow=():!string',
      '  function f():boolean{custom}         | function f():boolean{custom}        >> function f():!boolean',
      '  function f():A.B.C{custom}           | function f():A.B.C{custom}          >> function f():!A.B.C',
      '  function f(arg: A.B.C{custom}){}     | function f(arg: A.B.C{custom}){}    >> function f(arg: !A.B.C){}',
      '  const arrow=(arg:A.B.C{custom})=>{}  | const arrow=(arg:A.B.C{custom})=>{} >> const arrow=(arg:!A.B.C)=>{}',
      '  function f({}: A.B.C{custom}){}      | function f({}: A.B.C{custom}){}     >> function f({}: !A.B.C){}',
      '  const arrow=([]: A.B.C{custom})=>{}  | const arrow=([]: A.B.C{custom})=>{} >> const arrow=([]: !A.B.C)=>{}')
  })

  describe('custom template with multiple expr tests', () => {
    const run = runWithCustomTemplate('{{expr}} + {{expr}}')

    run('identifier', 'expr{custom}           | expr{custom}        >> expr + expr')
    run('expression',
      '  expr.test{custom}                    | expr.test{custom}   >> expr.test + expr.test',
      '  expr[index]{custom}                  | expr[index]{custom} >> expr[index] + expr[index]')
    run('binary-expression', 'x > 100{custom} | x > 100{custom}     >> x > 100 + x > 100')
    run('unary-expression', '!x{custom}       | !x{custom}          >> !x + !x')
    run('function-call',
      '  call(){custom}                       | call(){custom}      >> call() + call()',
      '  test.call(){custom}                  | test.call(){custom} >> test.call() + test.call()')
  })

  describe('custom template with :lower filter', () => {
    const run = runWithCustomTemplate('{{expr:lower}}')

    run('identifier', 'expr{custom}           | expr{custom}        >> expr')
    run('identifier', 'EXPR{custom}           | EXPR{custom}        >> expr')
    run('identifier', 'eXPr{custom}           | eXPr{custom}        >> expr')
  })

  describe('custom template with :upper filter', () => {
    const run = runWithCustomTemplate('{{expr:upper}}')

    run('identifier', 'expr{custom}           | expr{custom}        >> EXPR')
    run('identifier', 'EXPR{custom}           | EXPR{custom}        >> EXPR')
    run('identifier', 'eXPr{custom}           | eXPr{custom}        >> EXPR')
  })

  describe('custom template with :capitalize filter', () => {
    const run = runWithCustomTemplate('{{expr:capitalize}}')

    run('identifier', 'expr{custom}           | expr{custom}        >> Expr')
    run('identifier', 'EXPR{custom}           | EXPR{custom}        >> EXPR')
    run('identifier', 'eXPr{custom}           | eXPr{custom}        >> EXPr')
  })

  describe('custom template with snippet variables', () => {
    const run = runWithCustomTemplate('console.log($TM_LINE_NUMBER, {{expr}})')

    run('identifier', 'expr{custom}           | expr{custom}        >> console.log(1, expr)')
  })

  describe('custom template with escaped variable syntax', () => {
    const run = runWithCustomTemplate('console.log("\\$TM_LINE_NUMBER", \\$1.{{expr}})')

    run('identifier', 'expr{custom}           | expr{custom}        >> console.log("$TM_LINE_NUMBER", $1.expr)')
  })

  describe('custom template defined as array', () => {
    const run = runWithCustomTemplate(['Line 1 {{expr}}', ' Line 2 {{expr}}', '  Line 3 {{expr}}'])

    run('identifier', `expr{custom}           | expr{custom}        >> Line 1 expr
                                                                    >>  Line 2 expr
                                                                    >>   Line 3 expr`)
  })
})

function setUndefinedMode(config: vsc.WorkspaceConfiguration, value: 'Equal' | 'Typeof' | undefined) {
  return (done: Mocha.Done) => {
    config.update('undefinedMode', value, true).then(done, done)
  }
}

function setInferVarName(config: vsc.WorkspaceConfiguration, value: boolean) {
  return (done: Mocha.Done) => {
    config.update('inferVariableName', value, true).then(done, done)
  }
}
