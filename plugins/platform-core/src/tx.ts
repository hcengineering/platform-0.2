import { AnyLayout, Doc, Property, Ref, StringProperty } from '@anticrm/model'
import core, { CreateTx, DeleteTx, generateId, PushTx, UpdateTx } from '@anticrm/core'

export function newCreateTx<T extends Doc> (doc: T, _user: StringProperty): CreateTx {
  if (!doc._id) {
    doc._id = generateId()
  }

  const { _id, _class, ...objValue } = doc

  const tx: CreateTx = {
    _class: core.class.CreateTx,
    _id: generateId() as Ref<Doc>,
    _date: Date.now() as Property<number, Date>,
    _user,
    _objectId: _id,
    _objectClass: _class,
    object: (objValue as unknown) as AnyLayout
  }
  return tx
}

export function newPushTx (doc: Doc, _query: AnyLayout | undefined, _attribute: StringProperty, element: AnyLayout, _user: StringProperty): PushTx {
  const tx: PushTx = {
    _class: core.class.PushTx,
    _id: generateId() as Ref<Doc>,
    _objectId: doc._id,
    _objectClass: doc._class,
    _date: Date.now() as Property<number, Date>,
    _user,
    _attribute: _attribute,
    _attributes: element,
    _query
  }
  return tx
}

export function newUpdateTx (doc: Doc, _query: AnyLayout | undefined, values: AnyLayout, _user: StringProperty): UpdateTx {
  const tx: UpdateTx = {
    _class: core.class.UpdateTx,
    _id: generateId() as Ref<Doc>,
    _objectId: doc._id,
    _objectClass: doc._class,
    _date: Date.now() as Property<number, Date>,
    _user,
    _attributes: values,
    _query
  }
  return tx
}
export function newDeleteTx (doc: Doc, _query: AnyLayout | undefined, _user: StringProperty): DeleteTx {
  const tx: DeleteTx = {
    _class: core.class.DeleteTx,
    _id: generateId() as Ref<Doc>,
    _objectId: doc._id,
    _objectClass: doc._class,
    _date: Date.now() as Property<number, Date>,
    _user,
    _query
  }
  return tx
}
