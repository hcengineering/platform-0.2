import { Attribute, Class, Doc, DocumentValueOmit, Enum, fieldId, FieldId, Mixin, MODEL_DOMAIN, Obj, Ref } from '@anticrm/core'
import domains, {
  AddItemTx, Application, CollectionReference, CreateTx, DeleteTx, Indices, ItemTx, ObjectTx, Reference, RemoveItemTx,
  ShortID, Space, SpaceUser, Title, TitleSource, UpdateItemTx, UpdateTx, UXAttribute, UXObject, VDoc
} from '@anticrm/domains'
import { Builder } from '@anticrm/model'

/**
 * Mark some field as as primary to be indexed.
 */
export function primary<T extends Obj> (S: Builder, _id: Ref<Class<T>>, propertyKey: FieldId<T>): void {
  S.mixin(_id, domains.mixin.Indices, { primary: propertyKey(fieldId<T>()) })
}

/**
 * Apply an UX mixin to Class attribute.
 */
export function uxAttribute< T extends Doc> (S: Builder, _id: Ref<Class<T>>, _aid: Ref<Attribute>, values: DocumentValueOmit<UXAttribute, Attribute>): void {
  S.mixinEmb(_id, _aid, (ss) => ss._attributes, domains.mixin.UXAttribute, values)
}

/**
 * Apply an UX mixin to class.
 */
export function uxClass< T extends Doc> (S: Builder, _id: Ref<Class<T>>, values: DocumentValueOmit<UXObject<T>, Class<T>>): void {
  S.mixin(_id, domains.mixin.UXAttribute, values)
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

    UXAttribute: { } as Class<UXAttribute>, // eslint-disable-line
    UXObject: { } as Class<UXObject<Doc>> // eslint-disable-line
  })
}
