[![Build Status](https://travis-ci.org/ipatalas/vscode-postfix-ts.svg?branch=master)](https://travis-ci.org/ipatalas/vscode-postfix-ts)
[![bitHound Dependencies](https://www.bithound.io/github/ipatalas/vscode-postfix-ts/badges/dependencies.svg)](https://www.bithound.io/github/ipatalas/vscode-postfix-ts/master/dependencies/npm)
[![bitHound Code](https://www.bithound.io/github/ipatalas/vscode-postfix-ts/badges/code.svg)](https://www.bithound.io/github/ipatalas/vscode-postfix-ts)
[![codecov](https://codecov.io/gh/ipatalas/vscode-postfix-ts/branch/master/graph/badge.svg)](https://codecov.io/gh/ipatalas/vscode-postfix-ts)

# Postfix notation for TypeScript (and JS as well)

## Features

This extension features postfix templates that can be used to improve productivity.
It's been inspired on former, great [R# extension](https://github.com/controlflow/resharper-postfix)

I find it annoying to jump the cursor back and forth whenever I want to perform some simple operations. This extension makes it easier. I use this feature on daily basis in C# but was missing it in JS/TS until now.

A simple animation is worth more than words:

![feature X](images/demo.gif)

There is also a special handling for `.not` template which allows you to select specific expression to negate when having more options:

![feature X](images/demo-not.gif)

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
| **.foreach**      | `expr.forEach(item => )` |
| **.not**          | `!expr` |
| **.return**       | `return expr` |
| **.var**          | `var name = expr` |
| **.let**          | `let name = expr` |
| **.const**        | `const name = expr` |
| **.log**          | `console.log(expr)` |
| **.error**        | `console.error(expr)` |
| **.warn**         | `console.warn(expr)` |

## Configuration

This plugin contributes the following [settings](https://code.visualstudio.com/docs/customization/userandworkspace):

- `postfix.languages`: array of [language identifiers](https://code.visualstudio.com/docs/languages/identifiers) in which the extension will be available. Default value is  **['javascript', 'typescript']**

The `postfix.languages` setting can be used to make the extension available for inline JS/TS which is in other files like **.html**, **.vue** or others. You must still include `javascript` and `typescript` if you want the extension to be available there among the others.

## Known issues

It's a first release so there is not much validation in the extension. Sometimes it's possible that a specific template does not make much sense in some situations where it's suggested.

Feel free to open issues for whatever you think may improve the extension's value. New ideas for more templates are also welcome. Most of them are pretty easy to implement.

## Release Notes

## 1.5.0
- Ability to activate extension in files other than JS/TS

## 1.4.0
- `not` templates now really invert expressions (issue #7)

## 1.3.0
- New `foreach` template (issue #6) and general improvements in `for*` templates

## 1.2.0
- `Not` template can now negate different parts of the expression (selected from Quick Pick)
- Fixed issue #4 - Console templates are no longer suggested on console expression itself
- Fixed issue #5 - Already negated expressions can now be "un-negated" by using `not` template on them again

### 1.1.1

- Added support for postfix templates on unary expressions (ie. i++)
- Some fixes after adding basic tests

### 1.1.0

- Added console templates (PR from @jrieken, thanks!)

### 1.0.0

- Initial release