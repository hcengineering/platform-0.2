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
import { Session, Query } from '..'
import core, {
  Obj, Doc, Ref, Bag, Class, Type, Mixin, RefTo, SessionProto,
  PropertyType, AnyType, BagOf, InstanceOf, Embedded,
} from '..'
import { MemDb } from './memdb'

//////////

type Layout<T extends Obj> = T & { __layout: any } & SessionProto

/// Export FOR TEST
export class MemSession implements Session {

  readonly platform: Platform
  private memdb: MemDb
  private prototypes = new Map<Ref<Class<Obj>>, Object>()
  private sessionProto: SessionProto

  constructor(platform: Platform) {
    this.platform = platform
    this.memdb = new MemDb()

    this.sessionProto = {
      getSession: () => this,
      // getClass(this: Instance<Obj>) { return this.getSession().getInstance(this._class) }
    }
  }

  private createPropertyDescriptors(attributes: Bag<Type<PropertyType>>) {
    const result = {} as { [key: string]: PropertyDescriptor }
    for (const key in attributes) {
      if (key.startsWith('_')) {
        result[key] = {
          get(this: Layout<Obj>) {
            return this.__layout[key]
          },
          enumerable: true,
        }
      } else {
        const attribute = attributes[key]
        const exert = this.instantiate(attribute).exert
        console.log('exert, ' + key)
        console.log(attribute)
        result[key] = {
          get(this: Layout<Obj>) {
            const value = this.__layout[key] ?? attribute._default
            return exert(value)
          },
          enumerable: true,
        }
      }
    }
    return result
  }

  private createPrototype<T extends Obj>(clazz: Ref<Class<T>>) {
    console.log('create prototype: ' + clazz)
    const classInstance = this.memdb.get(clazz) as Class<Obj>
    const extend = classInstance.extends
    const parent = extend ? this.getPrototype(extend) : this.sessionProto
    const proto = Object.create(parent)
    this.prototypes.set(clazz, proto)

    const descriptors = this.createPropertyDescriptors(classInstance.attributes)
    if (classInstance.native) {
      const proto = this.platform.getMetadata(classInstance.native)
      Object.assign(descriptors, Object.getOwnPropertyDescriptors(proto))
    }
    Object.defineProperties(proto, descriptors)
    return proto
  }

  getPrototype<T extends Obj>(clazz: Ref<Class<T>>): T {
    return this.prototypes.get(clazz) ?? this.createPrototype(clazz)
  }

  instantiate<T extends Obj>(obj: T): T {
    const instance = Object.create(this.getPrototype(obj._class)) as Layout<T>
    instance.__layout = obj
    return instance
  }

  getInstance<T extends Doc>(ref: Ref<T>): T {
    return this.instantiate(this.memdb.get(ref))
  }

  newInstance<T extends Obj>(clazz: Ref<Class<T>>): T {
    throw new Error('not implemented')
  }

  ////

  find<T extends Doc>(clazz: Ref<Class<T>>, query: Query<T>): T[] {
    const layouts = this.memdb.findAll(clazz, query)
    return layouts.map(layout => this.instantiate(layout))
  }

  findOne<T extends Doc>(clazz: Ref<Class<T>>, query: Query<T>): T | undefined {
    const result = this.find(clazz, query)
    return result.length > 0 ? result[0] : undefined
  }

  ////

  loadModel(docs: Doc[]): void {
    this.memdb.load(docs)
  }

  ////

  mixin<M extends I, I extends Doc>(doc: Ref<I>, mixinClass: Ref<Mixin<M>>): M {
    // const layout = this.memdb.get(doc) as I
    // let mixins = layout._mixins // TODO: hide _mixin or make Layout recursive
    // if (!mixins) {
    //   mixins = []
    //   layout._mixins = mixins
    // }
    // const mixin = { _class: mixinClass }
    // mixins.push(mixin)

    // const proxy = new MixinProxy(mixin, this.getPrototype(mixinClass) as M, layout)
    // return new Proxy(proxy, this.mixinProxy) as unknown as M
    return {} as M
  }
}

export default (platform: Platform): Session => {

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

  ///

  class TSession {
    getSession(): Session { throw new Error('not implemented') }
  }

  class TObj extends TSession implements Obj {
    _class!: Ref<Class<this>>
    toIntlString(plural?: number): string {
      return this.getSession().getInstance(this._class).toIntlString(plural)
    }
  }

  abstract class TType<T extends PropertyType> extends TObj implements Type<T> {
    _default?: T
    abstract exert(value: T): any
  }

  class TRefTo<T extends Doc> extends TType<Ref<T>> implements RefTo<T> {
    to!: Ref<Class<T>>
    exert(value: Ref<T>) { return value ?? this._default }
  }

  class TMetadata extends TType<Metadata<any>> {
    exert(value: Metadata<any>) {
      const session = this.getSession() as MemSession
      return session.platform.getMetadata(value ?? this._default)
    }
  }

  class TBagOf<T extends PropertyType> extends TType<Bag<T>> implements BagOf<T> {
    of: Type<T>
    constructor(of: Type<T>) {
      super()
      this.of = of
    }
    exert(value: Bag<T>) {
      return new Proxy(value, new BagProxyHandler(this.of))
    }
  }

  class TInstanceOf<T extends Embedded> extends TType<T> implements InstanceOf<T> {
    of!: Ref<Class<T>>
    exert(value: T): any {
      const session = this.getSession() as MemSession
      return session.instantiate(value)
    }
  }

  platform.setMetadata(core.native.Object, TObj.prototype)
  platform.setMetadata(core.native.RefTo, TRefTo.prototype)
  platform.setMetadata(core.native.Metadata, TMetadata.prototype)
  platform.setMetadata(core.native.BagOf, TBagOf.prototype)
  platform.setMetadata(core.native.InstanceOf, TInstanceOf.prototype)

  return new MemSession(platform)
}
