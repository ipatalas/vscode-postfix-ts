import * as vsc from 'vscode'
import { runTest as Test, runTestQuickPick as QuickPick } from './runner'
import { describe, before, after } from 'mocha';

const config = vsc.workspace.getConfiguration('postfix')

describe('Single line template tests', () => {
  Test('not template - already negated expression | !expr{not}               >> expr')
  Test('let template - binary expression          | a * 3{let}               >> let name = a * 3')
  Test('let template - method call                | obj.call(){let}          >> let name = obj.call()')
  Test('let template - property access expression | obj.a.b{let}             >> let name = obj.a.b')
  Test('let template - element access expression  | obj.a[b]{let}            >> let name = obj.a[b]')
  Test('let template - postifx unary operator     | counter++{let}           >> let name = counter++')
  Test('let template - new expression             | new Type(1, 2, 3){let}   >> let name = new Type(1, 2, 3)')
  Test('let template - awaited expression         | await expr{let}          >> let name = await expr')
  Test('let template - escape dollar sign         | $expr.$a{let}            >> let name = $expr.$a')
  Test('let template - string literal #1          | "a string"{let}          >> let name = "a string"')
  Test('let template - string literal #2          | \'a string\'{let}        >> let name = \'a string\'')
  Test('let template - string literal #3          | `a string`{let}          >> let name = `a string`')
  Test('let template - string literal #4          | `a ${value} string`{let} >> let name = `a ${value} string`')
  Test('let template - string literal #5          | `a string ${value}`{let} >> let name = `a string ${value}`')

  Test('var template          | a.b{var}   >> var name = a.b')
  Test('var template (indent) | \ta.b{var} >> \tvar name = a.b')
  Test('const template        | a.b{const} >> const name = a.b')

  Test('log template   | expr{log}   >> console.log(expr)')
  Test('warn template  | expr{warn}  >> console.warn(expr)')
  Test('error template | expr{error} >> console.error(expr)')

  Test('log template - obj literal (empty) | {}{log}          >> console.log({})')
  Test('log template - obj literal         | {foo:"foo"}{log} >> console.log({foo:"foo"})')

  Test('return template | expr{return}       >> return expr')
  Test('return template | new Type(){return} >> return new Type()')

  Test('if template                       | expr{if}      >> if(expr){}', true)
  Test('else template                     | expr{else}    >> if(!expr){}', true)
  Test('else template - binary expression | x * 100{else} >> if(!(x*100)){}', true)

  Test('null template         | expr{null}         >> if(expr===null){}', true)
  Test('notnull template      | expr{notnull}      >> if(expr!==null){}', true)
  Test('undefined template    | expr{undefined}    >> if(expr===undefined){}', true)
  Test('notundefined template | expr{notundefined} >> if(expr!==undefined){}', true)

  Test('for template     | expr{for}           >> for(leti=0;i<expr.length;i++){}', true)
  Test('awaited for      | await expr{for}     >> for(leti=0;i<(awaitexpr).length;i++){}', true)
  Test('forof template   | expr{forof}         >> for(letitemofexpr){}', true)
  Test('foreach template | expr{foreach}       >> expr.forEach(item=>)', true)
  Test('awaited foreach  | await expr{foreach} >> (await expr).forEach(item => )')

  Test('cast template   | expr{cast}   >> (<>expr)')
  Test('castas template | expr{castas} >> (expr as )')

  Test('new template - identifier                 | Type{new}           >> new Type()')
  Test('new template - property access expression | namespace.Type{new} >> new namespace.Type()')

  Test('not template                                            | expr{not}                   >> !expr')
  Test('not template - inside a call expression                 | call.expression(expr{not})  >> call.expression(!expr)')
  Test('not template - inside a call expression - negated       | call.expression(!expr{not}) >> call.expression(expr)')
  Test('not template - binary expression                        | x * 100{not}                >> !(x * 100)')
  Test('not template - inside an if - identifier                | if (expr{not})              >> if(!expr)', true)
  Test('not template - inside an if - binary                    | if (x * 100{not})           >> if(!(x*100))', true)
  Test('not template - inside an if - brackets                  | if ((x * 100){not})         >> if(!(x*100))', true)
  Test('not template - already negated expression - method call | !x.method(){not}            >> x.method()')

  Test('promisify template - boolean       | const x:boolean{promisify} >> const x:Promise<boolean>')
  Test('promisify template - string        | const x:string{promisify}  >> const x:Promise<string>')
  Test('promisify template - custom type   | const x:A.B{promisify}     >> const x:Promise<A.B>')
  Test('promisify template - custom type 2 | const x:A.B.C.D{promisify} >> const x:Promise<A.B.C.D>')

  QuickPick('not template - complex conditions - first expression        | if (a > b && x * 100{not})    >> if(a>b&&!(x*100))', true, 0)
  QuickPick('not template - complex conditions - second expression       | if (a > b && x * 100{not})    >> if(a<=b||!(x*100))', true, 1)
  QuickPick('not template - complex conditions - cancel quick pick       | if (a > b && x * 100{not})    >> if(a>b&&x*100.)', true, 0, true)
  QuickPick('not template - complex conditions - first expression - alt  | if (a > b && x * 100{not}) {} >> if(a>b&&!(x*100)){}', true, 0)
  QuickPick('not template - complex conditions - second expression - alt | if (a > b && x * 100{not}) {} >> if(a<=b||!(x*100)){}', true, 1)
  QuickPick('not template - complex conditions - cancel quick pick - alt | if (a > b && x * 100{not}) {} >> if(a>b&&x*100.){}', true, 0, true)

  describe('undefined templates in `typeof` mode', () => {
    before(setUndefinedMode(config, 'Typeof'))
    after(setUndefinedMode(config, undefined))

    Test('undefined template    | expr{undefined}    >> if(typeofexpr==="undefined"){}', true)
    Test('notundefined template | expr{notundefined} >> if(typeofexpr!=="undefined"){}', true)
  })

  describe('custom template tests', () => {
    const run = runWithCustomTemplate('!{{expr}}')

    run('identifier', 'expr{custom}           | expr{custom}        >> !expr')
    run('string-literal', 'expr{custom}       | "expr"{custom}      >> !"expr"')
    run('expression',
      '  expr.test{custom}                    | expr.test{custom}   >> !expr.test',
      '  expr[index]{custom}                  | expr[index]{custom} >> !expr[index]')
    run('binary-expression', 'x > 100{custom} | x > 100{custom}     >> !x > 100')
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
})

function runWithCustomTemplate(template: string) {
  return (when: string, ...tests: string[]) =>
    describe(when, () => {
      before(setCustomTemplate(config, 'custom', template, [when]))
      after(resetCustomTemplates(config))

      tests.forEach(t => Test(t))
    })
}

function setUndefinedMode(config: vsc.WorkspaceConfiguration, value: 'Equal' | 'Typeof' | undefined) {
  return (done: Mocha.Done) => {
    config.update('undefinedMode', value, true).then(done, done)
  }
}

function setCustomTemplate(config: vsc.WorkspaceConfiguration, name: string, body: string, when: string[]) {
  return (done: Mocha.Done) => {
    config.update('customTemplates', [{
      'name': name,
      'body': body,
      'description': 'custom description',
      'when': when
    }], true).then(done, done)
  }
}

function resetCustomTemplates(config: vsc.WorkspaceConfiguration) {
  return (done: Mocha.Done) => {
    config.update('customTemplates', undefined, true).then(done, done)
  }
}
