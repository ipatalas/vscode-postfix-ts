import * as _ from 'lodash'
import { ExperimentalExternalGlobalApiEntry } from 'const-name'

export const registerConstNameApi = () => {
  if (!globalThis.__API_CONST_NAME_VAR_CALL) {
    globalThis.__API_CONST_NAME_VAR_CALL = []
  }
  globalThis.__API_CONST_NAME_VAR_CALL.push({
    handler(fullExpression, lastPartExpression) {
      if (fullExpression.startsWith('new')) {
        return _.lowerFirst(lastPartExpression)
      }
    }
  } as ExperimentalExternalGlobalApiEntry)
}
