# Change Log

## [1.9.3] - 2021-02-28
### Added:
- New `.promisify` template (Type.promisify -> Promise<Type>)
### Fixed:
- ["when" on TypeScript types](https://github.com/ipatalas/vscode-postfix-ts/issues/41)

## [1.9.2] - 2020-08-09
### Fixed:
- [Using .log for object](https://github.com/ipatalas/vscode-postfix-ts/issues/37)

## [1.9.1] - 2019-11-17
### Added:
- Support for two different modes for `.undefined` and `.notundefined` templates. See [#27](https://github.com/ipatalas/vscode-postfix-ts/issues/27)
### Fixed:
- [Postfix does not work in function expression with variable declaration](https://github.com/ipatalas/vscode-postfix-ts/issues/26)
- [await'ed expression - wrong replacement](https://github.com/ipatalas/vscode-postfix-ts/issues/28)
- [return template does not work in some cases](https://github.com/ipatalas/vscode-postfix-ts/issues/29)

## [1.9.0] - 2019-09-25
### Added:
- Support for multiline expressions!
- New `.new` template for expressions (Type.new -> new Type())
- Support for `new SomeType().` scope
### Changed:
- [Show more templates in return statement](https://github.com/ipatalas/vscode-postfix-ts/commit/ba3f09c90a6a7dcffb93fdfbf748c7a1b2b9aa3c#diff-8c49ec2779bc5b36c7347b60d5d79f08)
- [Do not show all templates when expression is a function argument](https://github.com/ipatalas/vscode-postfix-ts/commit/3518a7a75dd75d6dc0320313f11e8b897d86e268#diff-8c49ec2779bc5b36c7347b60d5d79f08)
- [Do not show all templates when expression is inside variable declaration or assignment](https://github.com/ipatalas/vscode-postfix-ts/commit/d1c69a3de69e11c40f89d091c8d438b1e42f5279#diff-8c49ec2779bc5b36c7347b60d5d79f08)
- Description in autocomplete now show the actual replacement instead of abstract one
### Fixed:
- [Binary expressions did not work when surrounded by brackets](https://github.com/ipatalas/vscode-postfix-ts/commit/52111da175ec3058184e199a5e65ee19fb90a296#diff-579bc502e2c0744db6d55afe38b9f3d9)
- Reload extension only when it's own configuration has been changed ([my bad!](https://github.com/ipatalas/vscode-postfix-ts/commit/8515485bfec38af2723be9b939066b1197725e46))

## [1.8.2] - 2019-09-01
### Changed:
- Merged PR [#25](https://github.com/ipatalas/vscode-postfix-ts/pull/25) - Enable extension in JSX/TSX by default

## [1.8.1] - 2018-10-21
### Fixed:
- Fixed issue [#17](https://github.com/ipatalas/vscode-postfix-ts/issues/17) - suggestions should not be shown inside comments

## [1.8.0] - 2018-07-01
### Added:
- Merged [#16](https://github.com/ipatalas/vscode-postfix-ts/pull/16) - cast templates (thanks @Coffee0127!)

## [1.7.0] - 2018-05-30
### Added:
- Enable usage of multiple '{{here}}' placeholder in a custom template (PR from @AdrieanKhisbe, thanks!)

## [1.6.0] - 2017-06-10
### Added:
- Support for array access expressions so that `expr[i]` will display suggestions as well
- Support for simple custom templates

## [1.5.1] - 2017-05-27
### Added:
- Fixed issue #9 - snippets always on top of suggestions

## [1.5.0] - 2017-05-13
### Added:
- Ability to activate extension in files other than JS/TS

## [1.4.0] - 2017-05-03
### Improved:
- `not` templates now really invert expressions (issue #7)

## [1.3.0] - 2017-04-11
### Added:
- New `foreach` template (issue #6) and general improvements in `for*` templates

## [1.2.0] - 2017-04-09
### Added:
- `not` template can now negate different parts of the expression (selected from Quick Pick)

### Fixed:
- Fixed issue #4 - Console templates are no longer suggested on console expression itself
- Fixed issue #5 - Already negated expressions can now be "un-negated" by using `not` template on them again

## [1.1.1] - 2017-04-05
### Added:
- Support for postfix templates on unary expressions (ie. i++)

### Fixed:
- Some fixes after adding basic tests

## [1.1.0] - 2017-04-03
### Added:
- Console templates (PR from @jrieken, thanks!)

## [1.0.0] - 2017-04-02

- Initial release
