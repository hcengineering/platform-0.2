import core, { generateId, VDoc, Tx, Ref, StringProperty, AnyLayout, Class, DateProperty, Doc } from '@anticrm/core'
import { Model } from '@anticrm/model'
import { OperationProtocol } from '.'
import { newCreateTx, newDeleteTx, newPushTx, newUpdateTx } from './tx'

export function createOperations (model: Model, processTx: (tx: Tx) => Promise<any>, getUserId: () => StringProperty): OperationProtocol {
  function create<T extends Doc> (_class: Ref<Class<T>>, values: AnyLayout): Promise<T> {
    const clazz = model.get(_class)
    if (clazz === undefined) {
      return Promise.reject(new Error('Class ' + _class + ' not found'))
    }

    const doc = model.newDoc(_class, generateId(), values)

    if (model.is(_class, core.class.VDoc)) {
      const vdoc = (doc as unknown) as VDoc
      if (!vdoc._createdBy) {
        vdoc._createdBy = getUserId()
      }
      if (!vdoc._createdOn) {
        vdoc._createdOn = Date.now() as DateProperty
      }
    }

    return processTx(newCreateTx(doc, getUserId())).then(() => doc)
  }

  function push<T extends Doc> (doc: Doc, query: AnyLayout | null, _attribute: StringProperty, element: AnyLayout): Promise<T> {
    return processTx(
      newPushTx(doc, query || undefined, _attribute, element, getUserId())
    ).then(() => doc as T)
  }

  function update<T extends Doc> (doc: T, query: AnyLayout | null, values: AnyLayout): Promise<T> {
    return processTx(
      newUpdateTx(doc, query || undefined, values, getUserId())
    ).then(() => doc as T)
  }
  function remove<T extends Doc> (doc: T, query: AnyLayout | null): Promise<T> {
    return processTx(
      newDeleteTx(doc, query || undefined, getUserId())
    ).then(() => doc as T)
  }
  return { create, push, update, remove }
}
