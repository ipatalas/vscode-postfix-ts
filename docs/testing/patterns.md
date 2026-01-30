# Common testing patterns

## Expression templates
Test('let template - binary expression | a * 3{let} >> let name = a * 3')
Test('let template - method call | obj.call(){let} >> let name = obj.call()')
Test('let template - property access | obj.a.b{let} >> let name = obj.a.b')

## Control flow templates
Test('if template | expr{if} >> if (expr) {\n\t\n}')
Test('else template | expr{else} >> if (!expr) {\n\t\n}')

## Loop templates
Test('for template | arr{for} >> for (let i = 0; i < arr.length; i++) {\n\t\n}')
Test('forof template | arr{forof} >> for (const item of arr) {\n\t\n}')

## Non-null assertions
Test('let template - non-null | test!{let} >> let name = test!')
Test('let template - chained | obj.call()!{let} >> let name = obj.call()!')

## String literals
Test('let template - string #1 | "a string"{let} >> let name = "a string"')
Test('let template - template literal | `a ${value} string`{let} >> let name = `a ${value} string`')
