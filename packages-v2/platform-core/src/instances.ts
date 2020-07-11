import { attributeKey, Class, Doc, Instance, Layout, MemDb, Obj, Platform, Ref } from '@anticrm/platform'
import { AnyType } from '.'

function createInstanceService(platform: Platform, modelDb: MemDb) {

  enum Stereotype {
    EMB,
    DOC
  }

  // M O D E L

  const prototypes = new Map<Ref<Class<Obj>>, Object>()

  const CoreRoot = {}

  async function getPrototype<T extends Obj>(_class: Ref<Class<T>>, stereotype: Stereotype): Promise<Object> {
    const prototype = prototypes.get(_class)
    if (prototype) {
      return prototype
    }

    const clazz = modelDb.get(_class) as Layout<Class<Doc>>
    const parent = clazz._extends ? await getPrototype(clazz._extends, stereotype) : CoreRoot
    const proto = Object.create(parent)
    prototypes.set(_class, proto)

    if (clazz._native) {
      const native = await platform.getResource(clazz._native)
      if (!native) {
        throw new Error(`something went wrong, can't load '${clazz._native}' resource`)
      }
      const descriptors = Object.getOwnPropertyDescriptors(native)
      Object.defineProperties(proto, descriptors)
      return proto
    }

    const attributes = clazz._attributes
    for (const key in attributes) {
      if (key === '_default') {
        continue
      } // we do not define `_default`'s type, it's infinitevely recursive :)
      const attr = attributes[key] as Layout<AnyType>

      const exert = platform.getResource(attr.exert)
      const hibernate = platform.getResource(attr.hibernate)

      const fullKey = stereotype === Stereotype.DOC
        ? key.startsWith('_') ? key : attributeKey(_class, key)
        : key

      Object.defineProperty(proto, key, {
        get(this: Instance<Obj>) {
          let value = (this.__update as any)[fullKey]
          if (!value) {
            value = (this.__layout as any)[fullKey]
          }
          return exert(value, this.__layout, key)
        },
        set(this: Instance<Obj>, value: any) {
          (this.__update as any)[fullKey] = hibernateBound(value)
          const id = (this.__layout as Layout<Doc>)._id
          if (id) {
            docUpdated(this as Instance<Doc>)
          }
        },
        enumerable: true
      })
    }
    return proto
  }

  async function getKonstructor<T extends Obj>(_class: Ref<Class<T>>, stereotype: Stereotype): Promise<Konstructor<T>> {
    const konstructor = konstructors.get(_class)
    if (konstructor) {
      return konstructor as unknown as Konstructor<T>
    } else {
      const proto = await getPrototype(_class, stereotype)
      const ctor = {
        [_class]: function (this: Instance<Obj>, obj: Layout<Doc>) {
          this.__layout = obj
          this.__update = {} as Layout<Doc>
        }
      }[_class] // A trick to `name` function as `_class` value
      proto.constructor = ctor
      ctor.prototype = proto
      konstructors.set(_class, ctor as unknown as Konstructor<Obj>)
      return ctor as unknown as Konstructor<T>
    }
  }

  async function instantiateEmb<T extends Emb>(obj: Layout<Obj>): Promise<Instance<T>> {
    const ctor = await getKonstructor(obj._class, Stereotype.EMB)
    return new ctor(obj) as Instance<T>
  }

}
