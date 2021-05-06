import { AnyLayout, Class, Doc, DocumentQuery, DocumentValue, Model, Obj, Ref } from '@anticrm/core'
import { CORE_CLASS_OBJECT_SELECTOR, CORE_CLASS_TX_OPERATION, TxOperation, TxOperationKind } from '../index'
import { updateDocument } from '../tx/modeltx'

export function updateDocumentSet<T extends Obj> (model: Model, doc: T, _attributes: Partial<DocumentValue<T>>): T {
  const txOp: TxOperation = { _class: CORE_CLASS_TX_OPERATION, kind: TxOperationKind.Set, _attributes: _attributes as unknown as AnyLayout }
  return updateDocument<T>(model, doc, [txOp])
}

export function updateDocumentPush<P extends Doc, T extends Obj> (model: Model, doc: P, _attribute: string, _attributes: DocumentValue<T>): P {
  const txOp: TxOperation = {
    _class: CORE_CLASS_TX_OPERATION,
    kind: TxOperationKind.Push,
    _attributes: _attributes as unknown as AnyLayout,
    selector: [{ _class: CORE_CLASS_OBJECT_SELECTOR, key: _attribute }]
  }
  return updateDocument<P>(model, doc, [txOp])
}

export function updateDocumentPull<P extends Doc, T extends Obj> (model: Model, doc: P, _attribute: string, _attributes: DocumentQuery<T>): P {
  const txOp: TxOperation = {
    _class: CORE_CLASS_TX_OPERATION,
    kind: TxOperationKind.Pull,
    selector: [{ _class: CORE_CLASS_OBJECT_SELECTOR, key: _attribute, pattern: _attributes as unknown as AnyLayout }]
  }
  return updateDocument<P>(model, doc, [txOp])
}

export function push<T extends Obj> (model: Model, _class: Ref<Class<Doc>>, _id: Ref<Doc>, attribute: string, attributes: DocumentValue<T>): void {
  const txOp: TxOperation = {
    _class: CORE_CLASS_TX_OPERATION,
    kind: TxOperationKind.Push,
    _attributes: attributes,
    selector: [{ _class: CORE_CLASS_OBJECT_SELECTOR, key: attribute }]
  }
  updateDocument(model, model.get(_id), [txOp])
}

export function pull<T extends Obj> (model: Model, _class: Ref<Class<Doc>>, _id: Ref<Doc>, attribute: string, attributes: DocumentValue<T>): void {
  const txOp: TxOperation = {
    _class: CORE_CLASS_TX_OPERATION,
    kind: TxOperationKind.Pull,
    _attributes: attributes,
    selector: [{ _class: CORE_CLASS_OBJECT_SELECTOR, key: attribute, pattern: attributes }]
  }
  updateDocument(model, model.get(_id), [txOp])
}
