import { ObjectTx } from '@anticrm/domains'

export function getTransactionObjectDetails (tx: ObjectTx): string | undefined {
  const details = tx._txDetails
  const res = [details?.id, details?.name]
    .filter((x): x is string => x !== undefined && x !== '')
    .join(' - ')

  return res === '' ? undefined : res
}
