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

import { Session, Query } from '..'
import core, { Obj, Doc, Ref, Bag, Class, PropertyType, Mixin, Instance, InstanceIntf } from '..'
import { MemDb } from './memdb'

function toHex(value: number, chars: number): string {
  const result = value.toString(16)
  if (result.length < chars) {
    return '0'.repeat(chars - result.length) + result
  }
  return result
}

let counter = Math.random() * (1 << 24) | 0
const random = toHex(Math.random() * (1 << 24) | 0, 6) + toHex(Math.random() * (1 << 16) | 0, 4)

function timestamp(): string {
  const time = (Date.now() / 1000) | 0
  return toHex(time, 8)
}

function count(): string {
  const val = counter++ & 0xffffff
  return toHex(val, 6)
}

function generateId(): string {
  return timestamp() + random + count()
}

////////////////////////////////

class InstanceProxy<T extends Obj> {
  __layout: Obj
  __proto: T

  constructor(layout: Obj, proto: T) {
    this.__layout = layout
    this.__proto = proto
  }
}

class InstanceProxyHandler implements ProxyHandler<InstanceProxy<Obj>> {
  private memdb: MemSession

  constructor(memdb: MemSession) {
    this.memdb = memdb
  }

  protected getFromLayout(target: InstanceProxy<Obj>, key: PropertyKey, receiver: any) {
    return Reflect.get(target.__layout, key, receiver)
  }

  get(target: InstanceProxy<Obj>, key: PropertyKey, receiver: any): any {
    const value = this.getFromLayout(target, key, receiver)
    if (!value) {
      return Reflect.get(target.__proto, key, receiver)
    }
    if (typeof value === 'object' && value.hasOwnProperty('_class')) {
      return this.memdb.instantiate(value)
    }
    return value
  }
}

class MixinProxy<M extends I, I extends Doc> extends InstanceProxy<M> {
  __instance: I

  constructor(layout: Obj, proto: M, instance: I) {
    super(layout, proto)
    this.__instance = instance
  }
}

class MixinProxyHandler extends InstanceProxyHandler implements ProxyHandler<MixinProxy<Doc, Doc>> {

  constructor(memdb: MemSession) {
    super(memdb)
  }

  protected getFromLayout(target: MixinProxy<Doc, Doc>, key: PropertyKey, receiver: any) {
    return super.getFromLayout(target, key, receiver) ??
      Reflect.get(target.__instance, key, receiver)
  }
}

function createRootPrototype(session: Session): InstanceIntf<Obj> {
  return {
    getSession() { return session },
    getClass(this: Instance<Obj>) { return this.getSession().getInstance(this._class) }
  }
}

export class MemSession implements Session {

  private memdb: MemDb
  private prototypes = new Map<Ref<Class<Obj>>, Object>()
  readonly instanceProxy: InstanceProxyHandler
  readonly mixinProxy: MixinProxyHandler

  constructor(memdb: MemDb) {
    this.memdb = memdb
    this.instanceProxy = new InstanceProxyHandler(this)
    this.mixinProxy = new MixinProxyHandler(this)
  }

  getPrototype<T extends Obj>(clazz: Ref<Class<T>>): T {
    const proto = this.prototypes.get(clazz)
    if (proto) {
      return proto as T
    } else {
      const classInstance = this.memdb.get(clazz) as Class<Obj>
      const extend = classInstance.extends ?? core.class.Object
      const proto = clazz === core.class.Object ?
        createRootPrototype(this) :
        Object.create(this.getPrototype(extend))
      for (const key in classInstance.attributes) {
        const attribute = classInstance.attributes[key]
        if (attribute._default !== undefined) {
          Object.defineProperty(proto, key, {
            value: attribute._default,
            enumerable: true,
            writable: false,
            configurable: false
          })
        }
      }
      this.prototypes.set(clazz, proto)
      return proto
    }
  }


  instantiate<T extends Obj>(obj: T): Instance<T> {
    const proxy = new InstanceProxy(obj, this.getPrototype(obj._class))
    return new Proxy(proxy, this.instanceProxy) as unknown as Instance<T>
  }

  getInstance<T extends Doc>(ref: Ref<T>): Instance<T> {
    return this.instantiate(this.memdb.get(ref))
  }

  newInstance<T extends Obj>(clazz: Ref<Class<T>>): T {
    throw new Error('not implemented')
  }

  ////

  find<T extends Doc>(clazz: Ref<Class<T>>, query: Query<T>): T[] {
    const layouts = this.memdb.findAll(clazz, query)
    return layouts.map(layout => this.instantiate(layout)) as T[]
  }

  findOne<T extends Doc>(clazz: Ref<Class<T>>, query: Query<T>): T | undefined {
    const result = this.find(clazz, query)
    return result.length > 0 ? result[0] : undefined
  }

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

//export default (platform: Platform): Session => new MemSession()