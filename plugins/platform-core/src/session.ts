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
import { MemDb } from './memdb'
import core, {
  Obj, Doc, Ref, Bag, Class, Type, Emb, Content,
  PropertyType, DiffDescriptors, Container, Session, ContainerId
} from '.'

export type Layout<T extends Obj> = T & { __layout: any } & SessionProto

export type Konstructor<T extends Obj> = (data: object) => T

export interface SessionProto {
  getSession(): Session
  __mapKey(_class: Ref<Class<Obj>>, key: string): string | null
}

export class TSession implements Session {

  readonly platform: Platform

  memdb: MemDb
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

  createDocument<T extends Doc>(_class: Ref<Class<T>>, data: object): T {
    const _id = (data as Content<Doc>)._id
    const container = this.memdb.get(_id, true) // TODO: must be create! raise error if container exists
    container._classes.push(_class as unknown as Ref<Class<Doc>>)
    const instance = this.instantiate(_class, container)
    Object.assign(instance, data)
    this.memdb.index(container)
    return instance as T
  }

  as<T extends Doc>(doc: Layout<Doc>, _class: Ref<Class<T>>): T | undefined {
    const layout = doc.__layout
    if (!layout)
      throw new Error('layout not found')
    const classes = layout._classes as string[]
    if (classes.includes(_class))
      return this.instantiate(_class, layout)
    return undefined
  }

  mixin<T extends E, E extends Doc>(obj: E, _class: Ref<Class<T>>, data: Omit<T, keyof E>): T {
    const _id = obj._id as Ref<T>
    return this.createDocument(_class, { _id, ...data })
  }

  getInstance<T extends Doc>(ref: Ref<T>, as: Ref<Class<T>>): T {
    const container = this.memdb.get(ref)
    const narrow = this.narrow(as, container._classes)
    if (narrow)
      return this.instantiate(narrow, container)
    else
      throw new Error('narrow failed')
  }

  narrow<T extends Doc>(as: Ref<Class<T>>, classes: Ref<Class<Doc>>[]): Ref<Class<T>> | undefined {
    for (const _class of classes) {
      const c = _class as unknown as Ref<Class<T>>
      if (c !== as && this.extends(c, as)) {
        return this.narrow(c, classes)
      }
    }
    return as
  }

  getClass<T extends Obj>(_class: Ref<Class<T>>): Class<T> {
    return this.getInstance(_class, core.class.StructuralFeature) as Class<T>
  }

  // getStruct<T extends Emb>(_class: Ref<Class<T>>): Class<T> {
  //   return this.getInstance(_class, core.class.Struct) as Class<T>
  // }

  extends<T extends Obj>(_class: Ref<Class<T>>, _extends: Ref<Class<Obj>>): boolean {
    let clazz: Ref<Class<Obj>> | undefined = _class
    while (clazz) {
      if (clazz === _extends)
        return true
      clazz = (this.memdb.get(clazz) as Pick<Class<Obj>, '_extends'>)._extends
    }
    return false
  }

  createClass<T extends E, E extends Doc>(
    _id: Ref<Class<T>>, _extends: Ref<Class<E>>,
    _attributes: DiffDescriptors<T, E>, _native?: Metadata<T>): Class<T> {
    const classClass = this.getInstance(core.class.Class, core.class.Class) as Class<Class<T>>
    return classClass.newInstance({
      _id,
      _attributes,
      _extends,
      _native
    })
  }

  createStruct<T extends E, E extends Emb>(
    _id: Ref<Class<T>>, _extends: Ref<Class<E>>,
    _attributes: DiffDescriptors<T, E>, _native?: Metadata<T>): Class<T> {
    const structClass = this.getInstance(core.class.Struct, core.class.Class) as Class<Class<T>>
    return structClass.newInstance({
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

  dump(): Container[] {
    return this.memdb.dump()
  }
}

