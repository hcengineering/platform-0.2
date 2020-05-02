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

import { Session, Query } from './types'
import core, { Obj, Doc, Ref, Bag, Class, PropertyType, Layout, Mixin } from './types'
import registry, { Extension } from './extension'
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

class InstanceProxy {
  __layout: Layout<Obj>
  __proto: Object

  constructor(layout: Layout<Obj>, proto: Object) {
    this.__layout = layout
    this.__proto = proto
  }
}

class InstanceProxyHandler implements ProxyHandler<InstanceProxy> {
  private memdb: MemSession

  constructor(memdb: MemSession) {
    this.memdb = memdb
  }

  get(target: InstanceProxy, key: PropertyKey): any {
    const value = Reflect.get(target.__layout, key)
    if (!value) {
      return Reflect.get(target.__proto, key, target)
    }
    if (typeof value === 'object' && value.hasOwnProperty('_class')) {
      return this.memdb.instantiate(value)
    }
    return value
  }
}

class MixinProxy extends InstanceProxy {
  __attached: InstanceProxy

  constructor(layout: Layout<Obj>, proto: Object, attached: InstanceProxy) {
    super(layout, proto)
    this.__attached = attached
  }
}

class MixinProxyHandler extends InstanceProxyHandler implements ProxyHandler<MixinProxy> {

  constructor(memdb: MemSession) {
    super(memdb)
  }

  get(target: MixinProxy, key: PropertyKey): any {
    const value = super.get(target, key)
    return value ?? super.get(target.__attached, key)
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

  getPrototype(clazz: Ref<Class<Obj>>): Object {
    const proto = this.prototypes.get(clazz)
    if (proto) {
      return proto
    }
    const classInstance = this.memdb.get(clazz) as Layout<Class<Obj>>
    if (classInstance.konstructor) {
      const extend = classInstance.extends ?? core.class.Object
      const proto = Object.create(clazz === core.class.Object ? Object : this.getPrototype(extend))

      // copy properties
      const source = registry.get(classInstance.konstructor).prototype
      Object.getOwnPropertyNames(source).forEach(key => {
        const value = key === 'getSession' ? () => this : source[key]
        Object.defineProperty(proto, key, {
          value,
          enumerable: true,
          writable: false,
          configurable: false
        })
      })

      this.prototypes.set(clazz, proto)
      return proto
    }
    throw new Error('TODO: no constructor for ' + clazz)
  }

  private newLayout<T extends Obj>(_class: Ref<Class<T>>): Layout<Obj> {
    return { _class }
  }

  instantiate(obj: Layout<Obj>): Obj {
    const proxy = new InstanceProxy(obj, this.getPrototype(obj._class))
    return new Proxy(proxy, this.instanceProxy) as unknown as Obj
  }

  getInstance<T extends Doc>(ref: Ref<T>): T {
    return this.instantiate(this.memdb.get(ref)) as T
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

  mixin<T extends Obj>(doc: Ref<Doc>, mixinClass: Ref<Mixin<T>>): T {
    const layout = this.memdb.get(doc)
    let mixins = layout._mixins // TODO: hide _mixin or make Layout recursive
    if (!mixins) {
      mixins = []
      layout._mixins = mixins
    }
    const mixin = this.newLayout(mixinClass)
    mixins.push(mixin)

    const instanace = new InstanceProxy(layout, this.getPrototype(layout._class))
    const proxy = new MixinProxy(mixin, this.getPrototype(mixin._class), instanace)
    return new Proxy(proxy, this.mixinProxy) as unknown as T
  }

}
