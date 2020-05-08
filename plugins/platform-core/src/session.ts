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
  Obj, Doc, Ref, Bag, Class, Type, RefTo, Embedded,
  PropertyType, BagOf, DiffDescriptors, DocContent, Container, Session, Content, ContainerId
} from '.'
import { MemDb } from './memdb'
import { generateId } from './objectid'
import { objectKeys } from 'simplytyped'

export type Layout<T extends Obj> = T & { __layout: any } & SessionProto

export type Konstructor<T extends Obj> = (data: object) => T

export interface SessionProto {
  getSession(): Session
  __mapKey(_class: Ref<Class<Obj>>, key: string): string | null
}

export class TSession implements Session {

  readonly platform: Platform

  private memdb: MemDb
  private prototypes = new Map<Ref<Class<Obj>>, Object>()
  private sessionProto: SessionProto

  readonly constructors = new Map<Ref<Class<Obj>>, Konstructor<Obj>>()

  constructor(platform: Platform) {
    this.platform = platform
    this.memdb = new MemDb()

    this.sessionProto = {
      getSession: () => this,
      __mapKey(_class: Ref<Class<Obj>>, key: string): string { throw new Error('object model must override.') }
    }
  }

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
    const classContainer = this.memdb.get(clazz)
    const extend = classContainer._extends as Ref<Class<Obj>>
    const parent = extend ? this.getPrototype(extend) : this.sessionProto
    const proto = Object.create(parent) as SessionProto & T
    this.prototypes.set(clazz, proto)

    const attributes = classContainer._attributes as Bag<Type<PropertyType>>
    if (classContainer._native) {
      const native = this.platform.getMetadata(classContainer._native as Metadata<Class<Obj>>)
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

  getInstance<T extends Doc>(ref: Ref<T>, as: Ref<Class<T>>): T {
    return this.instantiate(as, this.memdb.get(ref))
  }

  getClass<T extends Doc>(_class: Ref<Class<T>>): Class<T> {
    return this.getInstance(_class, core.class.Document) as Class<T>
  }

  getContainer(id: ContainerId, create?: boolean): Container {
    return this.memdb.get(id, create)
  }


  private extends<T extends Obj>(_class: Ref<Class<T>>, _extends: Ref<Class<Obj>>): boolean {
    let clazz: Ref<Class<Obj>> | undefined = _class
    while (clazz) {
      if (clazz === _extends)
        return true
      clazz = (this.memdb.get(clazz) as Pick<Class<Obj>, '_extends'>)._extends
    }
    return false
  }

  // getConstructor<T extends Obj>(_class: Ref<Class<T>>): Konstructor<T> {
  //   /// CLASS instance exists here!
  //   const ctor = this.constructors.get(_class)
  //   if (!ctor) {
  //     const ctor = 
  //   }
  //   return ctor as Konstructor<T>
  // }

  // newInstance<T extends Obj>(_class: Ref<Class<T>>, data: Content<T>): T {
  //   return this.getConstructor(_class).newInstance(data)
  // }

  createDocument<T extends E, E extends Doc>(
    _id: Ref<Class<T>>, _extends: Ref<Class<E>>,
    _attributes: DiffDescriptors<T, E>, _native?: Metadata<T>): Class<T> {
    const classClass = this.getInstance(core.class.Document, core.class.Document) as Class<Class<T>>
    return classClass.newInstance({
      _id,
      _attributes,
      _extends,
      _native
    })
  }

  ////

  // find<T extends Doc>(clazz: Ref<Class<T>>, query: Query<T>): T[] {
  //   const layouts = this.memdb.findAll(clazz, query)
  //   return layouts.map(layout => this.instantiateDoc(clazz, layout))
  // }

  // findOne<T extends Doc>(clazz: Ref<Class<T>>, query: Query<T>): T | undefined {
  //   const result = this.find(clazz, query)
  //   return result.length > 0 ? result[0] : undefined
  // }

  ////

  loadModel(docs: Container[]): void {
    this.memdb.load(docs)
  }

}

