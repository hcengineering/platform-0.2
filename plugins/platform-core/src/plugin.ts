//
// Copyright © 2020 Andrey Platov <andrey.v.platov@gmail.com>
// 
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// 
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { Platform, Metadata } from '@anticrm/platform'
import { CorePlugin, Query, pluginId } from '.'
import core, {
  Obj, Doc, Ref, Bag, Class, Type, RefTo, SessionProto, Embedded,
  PropertyType, BagOf, InstanceOf, Mixin, ArrayOf, Container, Session, Content
} from '.'
import { MemDb } from './memdb'

//////////

type Layout<T extends Obj> = T & { __layout: any } & SessionProto

class TSessionProto {
  getSession(): Session {
    throw new Error('session...') //return platform.getMetadata(CurrentSession) }
  }
}

class TObj extends TSessionProto {
  _class!: Ref<Class<this>>
  getClass(): Class<this> { return this.getSession().getInstance(this._class, 'core.class.Class' as Ref<Class<Class<this>>>) }
  toIntlString(plural?: number): string { throw new Error('not implemented') }
}

class TType<T extends PropertyType> extends TObj implements Embedded {
  _default?: T
  exert(value: T, target?: PropertyType, key?: PropertyKey): any { return value ?? this._default }
  hibernate(value: any): T { return value }
}

// class TRefTo<T extends Doc> extends Type<Ref<T>> {
//   to: Ref<Class<T>>
//   constructor(to: Ref<Class<T>>, _default?: Ref<T>) {
//     super(core.class.RefTo as Ref<Class<RefTo<T>>>, _default)
//     this.to = to
//   }
// }

class TInstanceOf<T extends Embedded> extends TType<T> {
  of!: Ref<Class<T>>
  exert(value: T) { return this.getSession().instantiateEmbedded(value) }
}

// C O L L E C T I O N S : A R R A Y

class ArrayProxyHandler implements ProxyHandler<PropertyType[]> {
  private type: Type<PropertyType>

  constructor(type: Type<PropertyType>) {
    this.type = type
  }

  get(target: PropertyType[], key: PropertyKey): any {
    const value = Reflect.get(target, key)
    return this.type.exert(value)
  }
}

class TArrayOf<T extends PropertyType> extends TType<T[]> {
  of!: Type<T>
  exert(value: T[]) {
    return new Proxy(value, new ArrayProxyHandler(this.of))
  }
}

// C O L L E C T I O N S : B A G

class BagProxyHandler implements ProxyHandler<Bag<PropertyType>> {
  private type: Type<PropertyType>

  constructor(type: Type<PropertyType>) {
    this.type = type
  }

  get(target: Bag<PropertyType>, key: string): any {
    const value = Reflect.get(target, key)
    return this.type.exert(value)
  }
}

class TBagOf<T extends PropertyType> extends TType<Bag<T>> {
  of!: Type<T>
  exert(value: Bag<T>) {
    return new Proxy(value, new BagProxyHandler(this.of))
  }
}

abstract class TDoc extends TObj implements Doc {
  _id!: Ref<this>
}

class ClassDocument<T extends Obj> extends TDoc implements Class<T> {
  _attributes!: Bag<Type<PropertyType>>
  _extends?: Ref<Class<Obj>>
  _native?: Metadata<T>
  toIntlString(plural?: number): string { return this._id }
}


export class TSession implements Session {

  readonly platform: Platform

  private memdb: MemDb
  private prototypes = new Map<Ref<Class<Obj>>, Object>()
  private sessionProto: SessionProto

  constructor(platform: Platform) {
    this.platform = platform
    this.memdb = new MemDb()

    this.sessionProto = {
      getSession: () => this,
    }
  }

  private createPropertyDescriptors(attributes: Bag<Type<PropertyType>>, keyPrefix?: string) {
    const result = {} as { [key: string]: PropertyDescriptor }
    for (const key in attributes) {
      if (key === '_class')
        continue
      const passForward = false // key.startsWith('_')
      if (passForward) {
        result[key] = {
          get(this: Layout<Obj>) {
            return this.__layout[key] ?? (attributes[key] as any)._default // TODO
          },
          set(this: Layout<Obj>, value) {
            this.__layout[key] = value
          },
          enumerable: true,
        }
      } else {
        const attribute = attributes[key]
        const instance = this.instantiateEmbedded(attribute)
        let keyPath = key
        if (keyPrefix && !keyPath.startsWith('_'))
          keyPath = keyPrefix + '/' + key
        result[key] = {
          get(this: Layout<Obj>) {
            const value = this.__layout[keyPath]
            return instance.exert(value, this, keyPath)
          },
          set(this: Layout<Obj>, value) {
            this.__layout[keyPath] = instance.hibernate(value)
          },
          enumerable: true,
        }
      }
    }
    return result
  }

  private createPrototype<T extends Obj>(clazz: Ref<Class<T>>, container: boolean) {
    const classContainer = this.memdb.get(clazz) as unknown as Omit<Class<Obj>, '_class'>
    const extend = classContainer._extends as Ref<Class<Obj>>
    const parent = extend ? this.getPrototype(extend, container) : this.sessionProto
    const proto = Object.create(parent)
    this.prototypes.set(clazz, proto)

    const attributes = classContainer._attributes as Bag<Type<PropertyType>>
    const descriptors = this.createPropertyDescriptors(attributes, container ? clazz : undefined)
    if (classContainer._native) {
      const proto = this.platform.getMetadata(classContainer._native as Metadata<Class<Obj>>)
      Object.assign(descriptors, Object.getOwnPropertyDescriptors(proto))
    }
    Object.defineProperties(proto, descriptors)
    return proto
  }

  getPrototype<T extends Obj>(clazz: Ref<Class<T>>, container: boolean): T {
    return this.prototypes.get(clazz) ?? this.createPrototype(clazz, container)
  }

  instantiateEmbedded<T extends Obj>(obj: T): T {
    const _class = obj._class
    const instance = Object.create(this.getPrototype(_class, false)) as Layout<T>
    instance._class = _class
    instance.__layout = obj
    return instance
  }

  private instantiateDoc<T extends Doc>(_class: Ref<Class<T>>, container: Container): T {
    const instance = Object.create(this.getPrototype(_class, true)) as Layout<T>
    Object.defineProperty(instance, '_class', {
      value: _class,
      enumerable: true
    })
    instance.__layout = container
    return instance
  }

  getInstance<T extends Doc>(ref: Ref<T>, as: Ref<Class<T>>): T {
    return this.instantiateDoc(as, this.memdb.get(ref))
  }

  newInstance<T extends Doc>(_class: Ref<Class<T>>, data: Content<T>): T {
    throw new Error('not implemented')
  }

  ////

  find<T extends Doc>(clazz: Ref<Class<T>>, query: Query<T>): T[] {
    const layouts = this.memdb.findAll(clazz, query)
    return layouts.map(layout => this.instantiateDoc(clazz, layout))
  }

  findOne<T extends Doc>(clazz: Ref<Class<T>>, query: Query<T>): T | undefined {
    const result = this.find(clazz, query)
    return result.length > 0 ? result[0] : undefined
  }

  ////

  loadModel(docs: Container[]): void {
    this.memdb.load(docs)
  }

  ////

  mixin<M extends I, I extends Doc>(doc: Ref<I>, mixinClass: Ref<Mixin<M>>): M {
    throw new Error('not implemented')
  }
}

export class TCorePlugin implements CorePlugin {

  readonly platform: Platform
  readonly pluginId = pluginId

  private session: TSession

  constructor(platform: Platform) {
    this.platform = platform
    this.session = new TSession(this.platform)
  }

  loadModel(docs: Container[]): void {
    this.session.loadModel(docs)
  }

  getSession(): Session { return this.session }
}

export default (platform: Platform): CorePlugin => {

  platform.setMetadata(core.native.Object, TObj.prototype)
  // platform.setMetadata(core.native.RefTo, TRefTo.prototype)
  platform.setMetadata(core.native.Type, TType.prototype)
  platform.setMetadata(core.native.BagOf, TBagOf.prototype)
  platform.setMetadata(core.native.ArrayOf, TArrayOf.prototype)
  platform.setMetadata(core.native.InstanceOf, TInstanceOf.prototype)

  platform.setMetadata(core.native.ClassDocument, ClassDocument.prototype)

  return new TCorePlugin(platform)
}
