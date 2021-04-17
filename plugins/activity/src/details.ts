import { ObjectTx } from '@anticrm/domains'

export function getTransactionObjectDetails (tx: ObjectTx): string | null {
  const details = (tx as ObjectTx)._txDetails
  if (!details) {
    return null
  }
  let result = ''
  if (details.id) {
    result += details.id
  }
  if (details.name) {
    if (result.length > 0) {
      result += ' - '
    }
    result += details.name
  }
  if (result.length === 0) {
    return null
  }
  return result
}
