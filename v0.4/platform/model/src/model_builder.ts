import { Class, CollectionId, Doc, DocumentValue, DocumentValueOmit, Emb, generateId, Mixin, Model, Obj, Ref } from '@anticrm/core'

export interface ModelBuilder {
  addDoc: <T extends Doc>(_objectClass: Ref<Class<T>>, _value: DocumentValue<T>, _id?: Ref<T>) => void
  addEmb: <T extends Doc, E extends Emb>(_objectClass: Ref<Class<T>>, _objectId: Ref<T>, _collectionId: CollectionId<T>, _class: Ref<Class<E>>, _value: DocumentValue<E>, _id?: Ref<E>) => void

  mixin: <E extends Doc, T extends Obj> (_objectClass: Ref<Class<E>>, _objectId: Ref<E>, _mixinClass: Ref<Mixin<T>>, _value: DocumentValueOmit<T, E>) => void
  mixinEmb: <E extends Doc, T extends Obj, C extends Emb> (_objectClass: Ref<Class<E>>, _objectId: Ref<E>, _collectionId: CollectionId<E>, _id: Ref<C>, _mixinClass: Ref<Mixin<T>>, _value: DocumentValueOmit<T, C>) => void
}

export function createModelBuilder (model: Model): ModelBuilder {
  const result: ModelBuilder = {
    addDoc: (_objectClass, _value, _id) => {
      if (_id !== undefined) {
        // Check for update operation.
        const obj = model._get(_id)
        if (obj !== undefined) {
          model.update(obj, _objectClass, _value)
          return
        }
      }
      // We could not use model.createDocument since it require a core classes to be defined.
      model.add({ _class: _objectClass, _id: _id ?? generateId(), ..._value })
    },
    addEmb: (_objectClass, _objectId, _collectionId, _class, _value, _id) => {
      if (_id !== undefined) {
        const emb = model._getEmb(_objectId, _collectionId, _id)
        if (emb !== undefined) {
          model.update(emb, _class, _value)
        }
      }
      model.addEmb(_objectId, _collectionId, { _class, _id: _id ?? generateId(), ..._value })
    },

    mixin: (_objectClass, _objectId, _mixinClass, _value) => {
      model.mixin(_objectId, _mixinClass, _value)
    },
    mixinEmb: (_objectClass, _objectId, _collectionId, _id, _mixinClass, _value) => {
      const emb = model.getEmb(_objectId, _collectionId, _id)
      model.mixinDocument(emb, _mixinClass, _value)
    }
  }
  return result
}
