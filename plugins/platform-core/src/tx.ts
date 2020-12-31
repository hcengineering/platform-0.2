import { AnyLayout, Doc, Emb, Property, Ref, StringProperty } from '@anticrm/model'
import core, { CreateTx, generateId, PushTx, VDoc } from '@anticrm/core'

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

export function newPushTx (vdoc: VDoc, _attribute: string, element: Emb, _user: StringProperty): PushTx {
  const tx: PushTx = {
    _class: core.class.PushTx,
    _id: generateId() as Ref<Doc>,
    _objectId: vdoc._id,
    _objectClass: vdoc._class,
    _date: Date.now() as Property<number, Date>,
    _user,
    _attribute: _attribute as StringProperty,
    _attributes: (element as unknown) as AnyLayout
  }
  return tx
}
