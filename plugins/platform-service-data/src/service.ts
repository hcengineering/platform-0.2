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
  Obj, Doc, Ref, Bag, Class, Type, Mixin, Instance, RefTo,
  AnyFunc, Layout, PropertyType, SessionProto, AnyType, BagOf, InstanceOf, Embedded, Proto
} from '..'
import { MemDb } from './memdb'

class BagProxyHandler implements ProxyHandler<Bag<PropertyType>> {
  private type: Instance<Type<PropertyType>>

  constructor(type: Instance<Type<PropertyType>>) {
    this.type = type
  }

  get(target: Bag<PropertyType>, key: string): any {
    const value = Reflect.get(target, key)
    return this.type.exert(value)
  }
}

//////////

/// Export FOR TEST
export class MemSession implements Session {

  readonly platform: Platform
  private memdb: MemDb
  private prototypes = new Map<Ref<Class<Obj>>, Object>()
  private sessionProto: SessionProto<Obj>

  constructor(platform: Platform) {
    this.platform = platform
    this.memdb = new MemDb()

    this.sessionProto = {
      getSession: () => this,
      getClass(this: Instance<Obj>) { return this.getSession().getInstance(this._class) }
    }
  }

  private createPropertyDescriptors(attributes: Bag<Type<PropertyType>>, native: boolean) {
    const result = {} as { [key: string]: PropertyDescriptor }
    for (const key in attributes) {
      // console.log('attribute: ' + key)
      if (key.startsWith('_')) {
        result[key] = {
          get(this: Instance<Obj>) {
            return (this.__layout as any)[key]
          },
          enumerable: true,
        }
      } else {
        if (!native) {
          const attribute = attributes[key]
          const instance = this.instantiate(attribute)

          result[key] = {
            get(this: Instance<Obj>) {
              const value = (this.__layout as any)[key] ?? attribute._default
              if (!value) {
                console.log('getter ' + key)
                console.log(this)
              }
              return instance.exert(value)
            },
            enumerable: true,
          }
        }
      }
    }
    return result
  }

  private createPrototype<T extends Obj>(clazz: Ref<Class<T>>) {
    // console.log('createPrototype: ' + clazz)
    const classInstance = this.memdb.get(clazz) as Class<Obj>
    const extend = classInstance.extends
    const parent = extend ? this.getPrototype(extend) : this.sessionProto
    const proto = Object.create(parent)

    let descriptors: Record<string, PropertyDescriptor>
    if (classInstance.native) {
      descriptors = this.createPropertyDescriptors(classInstance.attributes, true)
      const nativeImpl = this.platform.getMetadata(classInstance.native)
      Object.assign(descriptors, Object.getOwnPropertyDescriptors(nativeImpl))
    } else {
      descriptors = this.createPropertyDescriptors(classInstance.attributes, false)
    }
    Object.defineProperties(proto, descriptors)
    this.prototypes.set(clazz, proto)
    // console.log('created prototype: ' + clazz)
    return proto
  }

  getPrototype<T extends Obj>(clazz: Ref<Class<T>>): T {
    return this.prototypes.get(clazz) ?? this.createPrototype(clazz)
  }

  instantiate<T extends Obj>(obj: T): Instance<T> {
    const instance = Object.create(this.getPrototype(obj._class)) as Layout<T>
    instance.__layout = obj
    return instance as Instance<T>
  }

  getInstance<T extends Doc>(ref: Ref<T>): Instance<T> {
    return this.instantiate(this.memdb.get(ref))
  }

  newInstance<T extends Obj>(clazz: Ref<Class<T>>): T {
    throw new Error('not implemented')
  }

  ////

  find<T extends Doc>(clazz: Ref<Class<T>>, query: Query<T>): Instance<T>[] {
    const layouts = this.memdb.findAll(clazz, query)
    return layouts.map(layout => this.instantiate(layout))
  }

  findOne<T extends Doc>(clazz: Ref<Class<T>>, query: Query<T>): Instance<T> | undefined {
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

abstract class SessionImpl<T extends Obj> implements SessionProto<T>, Layout<T> {
  abstract __layout: T
  abstract getSession(): Session
  abstract getClass(): Instance<Class<T>>
}

abstract class TObj<T extends Obj> extends SessionImpl<T> implements Proto<Obj> {
  abstract _class: Ref<Class<T>>
  toIntlString(): string { return '' }
}

type MetadataType = Type<Metadata<any>>

abstract class TMetadata<T extends MetadataType> extends TObj<MetadataType> implements Proto<MetadataType> {
  _default?: T
  exert(value: PropertyType) { return value }
}

console.log(TMetadata.prototype.exert)

export default (platform: Platform): Session => {
  const ObjectImpl = {
    toIntlString(this: Instance<Obj>, plural?: number): string {
      return this.getClass().toIntlString(plural)
    }
  }

  const RefToImpl = {
    exert(this: Instance<RefTo<Doc>>, value: Ref<Doc>) { return value }
  }

  const MetadataImpl = {
    exert(this: Instance<Type<Metadata<AnyFunc>>>, value: Metadata<AnyFunc>) {
      const session = this.getSession() as MemSession
      return session.platform.getMetadata(value ?? this._default) // TODO
    }
  }

  const BagOf_excert = function (this: Instance<AnyType>, value: PropertyType): any {
    const _this = this as Instance<BagOf<PropertyType>>
    return new Proxy(value as Bag<PropertyType>, new BagProxyHandler(_this.of))
  }

  const InstanceOf_excert = function (this: Instance<AnyType>, value: PropertyType): any {
    const session = this.getSession() as MemSession
    return session.instantiate(value as Obj)
  }

  platform.setMetadata(core.native.Object, ObjectImpl)
  platform.setMetadata(core.native.RefTo, RefToImpl)
  platform.setMetadata(core.native.Metadata, MetadataImpl)
  platform.setMetadata(core.method.BagOf_excert, BagOf_excert)
  platform.setMetadata(core.method.InstanceOf_excert, InstanceOf_excert)

  return new MemSession(platform)
}
