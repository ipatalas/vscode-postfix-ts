# Postfix notation for TypeScript (and JS as well)

## Features

This extension features postfix templates that can be used to improve productivity.
It's been inspired on former, great [R# extension](https://github.com/controlflow/resharper-postfix)

I find it difficult to jump the cursor back and forth whenever I want to perform some simple operations. This extension makes it easier. I use this feature on daily basis in C# but was missing it in JS/TS until now.

A simple animation is worth more than words:

![feature X](images/demo.gif)

All available templates (`expr` means the expression on which the template is applied):

| Template          | Outcome |
| -------:          | ------- |
| **.if**           | `if (expr)` |
| **.else**         | `if (!expr)` |
| **.null**         | `if (expr === null)` |
| **.notnull**      | `if (expr !== null)` |
| **.undefined**    | `if (expr === undefined)` |
| **.notundefined** | `if (expr !== undefined)` |
| **.for**          | `for (let i = 0; i < expr.Length; i++)` |
| **.forof**        | `for (let item of expr)` |
| **.not**          | `!expr` |
| **.return**       | `return expr` |
| **.var**          | `var name = expr` |
| **.let**          | `let name = expr` |
| **.const**        | `const name = expr` |

## Known issues

It's a first release so there is not much validation in the extension. Sometimes it's possible that a specific template does not make much sense in some situations where it's suggested.

Feel free to open issues for whatever you think may improve the extension's value. New ideas for more templates are also welcome. Most of them are pretty easy to implement.

## Release Notes

### 1.0.0

Initial release