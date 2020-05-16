//
// Copyright © 2020 Anticrm Platform Contributors.
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
import { MemDb } from './memdb'
import { Obj, Ref, Class, Bag, Type, PropertyType } from '.'

type Layout<T> = T & {
  __layout: any
}

export class Prototypes {

  private platform: Platform
  private memdb: MemDb
  private sessionProto: Object

  private prototypes = new Map<Ref<Class<Obj>>, Object>()

  constructor(platform: Platform, memdb: MemDb, sessionProto: Object) {
    this.platform = platform
    this.memdb = memdb
    this.sessionProto = sessionProto
  }

  // readonly constructors = new Map<Ref<Class<Obj>>, Konstructor<Obj>>()

  // constructor(platform: Platform) {
  //   this.platform = platform
  //   this.memdb = new MemDb()

  //   this.sessionProto = {
  //     getSession: () => this,
  //     __mapKey(_class: Ref<Class<Obj>>, key: string): string { throw new Error('object model must override.') }
  //   }
  // }

  private createPropertyDescriptors(attributes: Bag<Type<PropertyType>>, mapKey: (key: string) => string | null) {
    const result = {} as { [key: string]: PropertyDescriptor }
    for (const key in attributes) {
      const keyPath = mapKey(key)
      if (keyPath) {
        const attribute = attributes[key]
        const instance = this.instantiate(attribute._class, attribute)
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

  private createPrototype<T extends Obj>(clazz: Ref<Class<T>>) {
    const classContainer = this.memdb.getClass(clazz)
    const extend = classContainer._extends as Ref<Class<Obj>>
    const parent: any = extend ? this.getPrototype(extend) : this.sessionProto
    const proto = Object.create(parent) //as SessionProto & T
    this.prototypes.set(clazz, proto)

    const attributes = classContainer._attributes as Bag<Type<PropertyType>>
    if (classContainer._native) {
      const native = this.platform.getMetadata(classContainer._native as Metadata<Class<Obj>>)
      if (native === undefined) {
        throw new Error('no native prototype: ' + classContainer._native)
      }
      Object.defineProperties(proto, Object.getOwnPropertyDescriptors(native))
    }

    const descriptors = this.createPropertyDescriptors(attributes, key => proto.__mapKey(clazz, key))
    Object.defineProperties(proto, descriptors)
    return proto
  }

  getPrototype<T extends Obj>(clazz: Ref<Class<T>>) {
    return this.prototypes.get(clazz) ?? this.createPrototype(clazz)
  }

  instantiate<T extends Obj>(_class: Ref<Class<T>>, __layout: any): T {
    const instance = Object.create(this.getPrototype(_class))
    instance._class = _class
    instance.__layout = __layout
    return instance
  }

}