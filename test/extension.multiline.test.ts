import { runTestMultiline as Test } from './runner'
import { TabSize } from './utils'

const indent = (size: number) => ' '.repeat(size * TabSize)

describe('Multiline template tests', () => {
  Test(`let template - method call
      | object.call()     >> let name = object.call()
      | \t.anotherCall()  >> \t.anotherCall()
      | \t.lastOne(){let} >> \t.lastOne()`)

  Test(`let template - method call (equal indentation)
      | \tobject.call() >> \tlet name = object.call()
      | .anotherCall()  >> \t.anotherCall()
      | .lastOne(){let} >> \t.lastOne()`)

  Test(`let template - method call (indentation - tabs)
      | \t\tobject.call()     >> \t\tlet name = object.call()
      | \t\t\t.anotherCall()  >> \t\t\t.anotherCall()
      | \t\t\t.lastOne(){let} >> \t\t\t.lastOne()`)

  // first line gets to keep original indentation in VSCode
  Test(`let template - method call (indentation - spaces)
      | ${indent(2)}object.call()   >> ${indent(2)}let name = object.call()
      | ${indent(3)}.anotherCall()  >> \t\t\t.anotherCall()
      | ${indent(3)}.lastOne(){let} >> \t\t\t.lastOne()`)

  Test(`let template - method call (indentation - mixed)
      | \t\tobject.call()          >> \t\tlet name = object.call()
      | ${indent(3)}.anotherCall() >> \t\t\t.anotherCall()
      | \t\t\t.lastOne(){let}      >> \t\t\t.lastOne()`)

  Test(`let template - method call (indentation - completely mixed)
      | \tobject.call()     >> \tlet name = object.call()
      | \t  .anotherCall()  >> \t\t  .anotherCall()
      | \t  .lastOne(){let} >> \t\t  .lastOne()`)

  Test(`let template - property access expression
      | object.   >> let name = object.
      | \t.a      >> \t.a
      | \t.b      >> \t.b
      | \t.c{let} >> \t.c`)

  Test(`let template - unary expression
      | object.     >> let name = object.
      | \t.a        >> \t.a
      | \t.b        >> \t.b
      | \t.c++{let} >> \t.c++`)

  Test(`return template - new expression
      | new Type(    >> return new Type(
      | \t1,         >> \t1,
      | \t2,         >> \t2,
      | \t3){return} >> \t3)`)
})
