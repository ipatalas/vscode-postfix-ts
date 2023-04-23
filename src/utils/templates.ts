import * as vsc from 'vscode'
import { IPostfixTemplate } from '../template'
import { AwaitTemplate } from '../templates/awaitTemplate'
import { CastTemplate } from '../templates/castTemplates'
import { ConsoleTemplate } from '../templates/consoleTemplates'
import { CustomTemplate } from '../templates/customTemplate'
import { EqualityTemplate } from '../templates/equalityTemplates'
import { ForTemplate, ForOfTemplate, ForEachTemplate, ForInTemplate } from '../templates/forTemplates'
import { IfTemplate, ElseTemplate, IfEqualityTemplate } from '../templates/ifTemplates'
import { NewTemplate } from '../templates/newTemplate'
import { NotTemplate } from '../templates/notTemplate'
import { PromisifyTemplate } from '../templates/promisifyTemplate'
import { ReturnTemplate } from '../templates/returnTemplate'
import { VarTemplate } from '../templates/varTemplates'
import { CallTemplate } from '../templates/callTemplate'

export const loadCustomTemplates = () => {
  const config = vsc.workspace.getConfiguration('postfix')
  const templates = config.get<ICustomTemplateDefinition[]>('customTemplates')
  if (templates) {
    return templates.map(t => new CustomTemplate(t.name, t.description, t.body, t.when))
  }

  return []
}

export const loadBuiltinTemplates = () => {
  const config = vsc.workspace.getConfiguration('postfix')
  const disabledTemplates = config.get<string[]>('disabledBuiltinTemplates', [])

  const templates: IPostfixTemplate[] = [
    new CastTemplate('cast'),
    new CastTemplate('castas'),
    new CallTemplate('call'),
    new ConsoleTemplate('log'),
    new ConsoleTemplate('warn'),
    new ConsoleTemplate('error'),
    new ForTemplate('for'),
    new ForOfTemplate('forof'),
    new ForInTemplate('forin'),
    new ForEachTemplate('foreach'),
    new IfTemplate('if'),
    new ElseTemplate('else'),
    new IfEqualityTemplate('null', '===', 'null'),
    new IfEqualityTemplate('notnull', '!==', 'null'),
    new IfEqualityTemplate('undefined', '===', 'undefined', true),
    new IfEqualityTemplate('notundefined', '!==', 'undefined', true),
    new EqualityTemplate('null', '===', 'null'),
    new EqualityTemplate('notnull', '!==', 'null'),
    new EqualityTemplate('undefined', '===', 'undefined', true),
    new EqualityTemplate('notundefined', '!==', 'undefined', true),
    new NewTemplate('new'),
    new NotTemplate('not'),
    new PromisifyTemplate('promisify'),
    new ReturnTemplate('return'),
    new VarTemplate('var'),
    new VarTemplate('let'),
    new VarTemplate('const'),
    new AwaitTemplate('await')
  ]

  return templates.filter(t => !disabledTemplates.includes(t.templateName))
}

interface ICustomTemplateDefinition {
  name: string
  description: string
  body: string,
  when: string[]
}
