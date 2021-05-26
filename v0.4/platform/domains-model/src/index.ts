import { Class, Enum, fieldId, FieldId, Mixin, MODEL_DOMAIN, Obj, Ref } from '@anticrm/core'
import domains, { AddItemTx, Application, CollectionReference, CreateTx, DeleteTx, Indices, ItemTx, ObjectTx, Reference, RemoveItemTx, ShortID, Space, SpaceUser, Title, TitleSource, UpdateItemTx, UpdateTx, VDoc } from '@anticrm/domains'
import { Builder } from '@anticrm/model'

export function primary<T extends Obj> (S: Builder, _id: Ref<Class<T>>, propertyKey: FieldId<T>): void {
  S.addPostProcess((model) => {
    model.mixin(_id, domains.mixin.Indices, { primary: propertyKey(fieldId<T>()) })
  })
}

export function model (S: Builder): void {
  S.loadEnum(__filename, domains.enum, {
    TitleSource: { } as Enum<TitleSource>, // eslint-disable-line
  })
  S.loadClass(__filename, domains.class, {
    AddItemTx: { } as Class<AddItemTx>, // eslint-disable-line
    Application: { } as Class<Application>, // eslint-disable-line
    CreateTx: { } as Class<CreateTx>, // eslint-disable-line
    DeleteTx: { } as Class<DeleteTx>, // eslint-disable-line
    ItemTx: { } as Class<ItemTx>, // eslint-disable-line
    ObjectTx: { } as Class<ObjectTx>, // eslint-disable-line
    Reference: { } as Class<Reference>, // eslint-disable-line
    RemoveItemTx: { } as Class<RemoveItemTx>, // eslint-disable-line
    Space: { } as Class<Space>, // eslint-disable-line
    SpaceUser: { } as Class<SpaceUser>, // eslint-disable-line
    Title: { } as Class<Title>, // eslint-disable-line
    UpdateItemTx: { } as Class<UpdateItemTx>, // eslint-disable-line
    UpdateTx: { } as Class<UpdateTx>, // eslint-disable-line
    VDoc: { } as Class<VDoc>, // eslint-disable-line
  }, MODEL_DOMAIN)

  S.loadMixin(__filename, domains.mixin, {
    CollectionReference: { } as Mixin<CollectionReference>, // eslint-disable-line
    Indices: { } as Mixin<Indices>, // eslint-disable-line
    ShortID: { } as Mixin<ShortID>, // eslint-disable-line
  })
}
