import * as vsc from 'vscode'
import { IPostfixTemplate } from '../template'
import { CastTemplate } from '../templates/castTemplates'
import { ConsoleTemplate } from '../templates/consoleTemplates'
import { CustomTemplate } from '../templates/customTemplate'
import { EqualityTemplate } from '../templates/equalityTemplates'
import { ForTemplate, ForOfTemplate, ForEachTemplate } from '../templates/forTemplates'
import { IfTemplate, ElseTemplate, IfEqualityTemplate } from '../templates/ifTemplates'
import { NewTemplate } from '../templates/newTemplate'
import { NotTemplate } from '../templates/notTemplate'
import { PromisifyTemplate } from '../templates/promisifyTemplate'
import { ReturnTemplate } from '../templates/returnTemplate'
import { VarTemplate } from '../templates/varTemplates'

export const loadCustomTemplates = () => {
  const config = vsc.workspace.getConfiguration('postfix')
  const templates = config.get<ICustomTemplateDefinition[]>('customTemplates')
  if (templates) {
    return templates.map(t => new CustomTemplate(t.name, t.description, t.body, t.when))
  }
}

export const loadBuiltinTemplates = () => {
  const templates: IPostfixTemplate[] = [
    new CastTemplate('cast'),
    new CastTemplate('castas'),
    new ConsoleTemplate('log'),
    new ConsoleTemplate('warn'),
    new ConsoleTemplate('error'),
    new ForTemplate('for'),
    new ForOfTemplate('forof'),
    new ForEachTemplate('foreach'),
    new IfTemplate('if'),
    new ElseTemplate('else'),
    new IfEqualityTemplate('null', '===', null),
    new IfEqualityTemplate('notnull', '!==', null),
    new IfEqualityTemplate('undefined', '===', undefined, true),
    new IfEqualityTemplate('notundefined', '!==', undefined, true),
    new EqualityTemplate('null', '===', null),
    new EqualityTemplate('notnull', '!==', null),
    new EqualityTemplate('undefined', '===', undefined, true),
    new EqualityTemplate('notundefined', '!==', undefined, true),
    new NewTemplate('new'),
    new NotTemplate('not'),
    new PromisifyTemplate('promisify'),
    new ReturnTemplate('return'),
    new VarTemplate('var'),
    new VarTemplate('let'),
    new VarTemplate('const')
  ]

  return templates
}

interface ICustomTemplateDefinition {
  name: string
  description: string
  body: string,
  when: string[]
}
