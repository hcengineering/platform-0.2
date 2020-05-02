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

class Instantiator implements ProxyHandler<Layout<Obj>> {
  private memdb: MemSession

  constructor(memdb: MemSession) {
    this.memdb = memdb
  }

  get(target: Layout<Obj>, key: PropertyKey): any {
    const value = Reflect.get(target, key)
    if (!value) {
      const proto = this.memdb.getPrototype(target._class)
      return Reflect.get(proto, key, target)
    }
    if (typeof value === 'object' && value.hasOwnProperty('_class')) {
      return new Proxy(value, this.memdb.instantiator)
    }
    return value
  }
}

export class MemSession implements Session {

  private memdb: MemDb
  private prototypes = new Map<Ref<Class<Obj>>, Object>()
  readonly instantiator: Instantiator

  constructor(memdb: MemDb) {
    this.memdb = memdb
    this.instantiator = new Instantiator(this)
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

  private instantiate(obj: Layout<Obj>): Obj {
    return new Proxy(obj, this.instantiator) as unknown as Obj
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

  mixin<T extends Obj>(doc: Doc, mixin: Ref<Mixin<T>>): T {
    throw new Error('not implemented')
    // const layout = this.memdb.get(doc._id)
    // let mixins = layout._mixins
    // if (!mixins) {
    //   mixins = []
    //   layout._mixins = mixins
    // }
  }

}
