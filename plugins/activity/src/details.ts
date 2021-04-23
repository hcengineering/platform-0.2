import { ObjectTx } from '@anticrm/domains'

export function getTransactionObjectDetails (tx: ObjectTx): string | undefined {
  const details = tx._txDetails
  if (details === undefined) {
    return undefined
  }
  let result = ''
  if (details.id !== undefined) {
    result += details.id
  }
  if (details.name !== undefined) {
    if (result.length > 0) {
      result += ' - '
    }
    result += details.name
  }
  if (result.length === 0) {
    return undefined
  }
  return result
}
