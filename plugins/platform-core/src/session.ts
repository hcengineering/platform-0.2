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

import { Platform, Resource, allValues } from '@anticrm/platform'
import { Db, Container } from '@anticrm/platform-db'
import { generateId } from './objectid'
import core, {
  Obj, Doc, Ref, Bag, Class, Type, Emb, Content,
  PropertyType, DiffDescriptors, Session
} from '.'

export type Layout<T extends Obj> = T & { __layout: any } & SessionProto

export type Konstructor<T extends Obj> = (data: object) => Promise<T>

export interface SessionProto {
  getSession(): Session
  __mapKey(_class: Ref<Class<Obj>>, key: string): string | null
}

export class TSession implements Session {

  readonly platform: Platform

  private memdb: Db
  private prototypes = new Map<Ref<Class<Obj>>, Object>()
  private sessionProto: SessionProto

  readonly constructors = new Map<Ref<Class<Obj>>, Konstructor<Obj>>()

  constructor(platform: Platform, memdb: Db) {
    this.platform = platform
    this.memdb = memdb

    this.sessionProto = {
      getSession: () => this,
      __mapKey(_class: Ref<Class<Obj>>, key: string): string { throw new Error('object model must override.') }
    }
  }

  private async createPropertyDescriptors(attributes: Bag<Type<PropertyType>>, mapKey: (key: string) => string | null):
    Promise<{ [key: string]: PropertyDescriptor }> {
    const result = {} as { [key: string]: Promise<PropertyDescriptor> }
    for (const key in attributes) {
      const keyPath = mapKey(key)
      if (keyPath) {
        const attribute = attributes[key]
        const instance = this.instantiate(attribute._class, attribute)
        result[key] = instance.then(type => ({
          get(this: Layout<Obj>) {
            const value = this.__layout[keyPath]
            return type.exert(value, this, keyPath)
          },
          set(this: Layout<Obj>, value) {
            this.__layout[keyPath] = type.hibernate(value)
          },
          enumerable: true,
        }))
      }
    }
    return allValues(result)
  }

  private async createPrototype<T extends Obj>(clazz: Ref<Class<T>>): Promise<object> {
    const classContainer = this.memdb.getClass(clazz)
    const extend = classContainer._extends as Ref<Class<Obj>>
    const parent = extend ? await this.getPrototype(extend) : this.sessionProto
    const proto = Object.create(parent) as SessionProto & T
    this.prototypes.set(clazz, proto)

    const attributes = classContainer._attributes as Bag<Type<PropertyType>>
    if (classContainer._native) {
      const native = this.platform.resolve(classContainer._native as Resource<object>)
      const desc = await native.then(native => {
        if (native === undefined) {
          throw new Error('no native prototype: ' + classContainer._native)
        }
        return Object.getOwnPropertyDescriptors(native)
      })
      Object.defineProperties(proto, desc)
    }

    const descriptors = await this.createPropertyDescriptors(attributes, key => proto.__mapKey(clazz, key))
    Object.defineProperties(proto, descriptors)
    return proto
  }

  async getPrototype<T extends Obj>(clazz: Ref<Class<T>>): Promise<object> {
    return this.prototypes.get(clazz) ?? this.createPrototype(clazz)
  }

  async instantiate<T extends Obj>(_class: Ref<Class<T>>, __layout: any): Promise<T> {
    const instance = Object.create(await this.getPrototype(_class)) as Layout<T>
    instance._class = _class
    instance.__layout = __layout
    return instance
  }

  instantiateSync<T extends Obj>(_class: Ref<Class<T>>, __layout: any): T {
    const proto = this.prototypes.get(_class)
    if (!proto)
      throw new Error('instanceSync failed, no prototype for class: ' + _class)
    const instance = Object.create(proto)
    instance._class = _class
    instance.__layout = __layout
    return instance
  }

  getInstanceSync<T extends Doc>(ref: Ref<T>): T {
    const container = this.memdb.get(ref)
    return this.instantiateSync(container._class as Ref<Class<T>>, container)
  }

  async createDoc<T extends Doc>(_class: Ref<Class<T>>, data: object): Promise<T> {
    let _id = (data as Content<Doc>)._id
    if (_id === undefined) {
      _id = generateId() as Ref<Doc>
    }
    const container = this.memdb.createContainer(_id, _class)
    const instance = await this.instantiate(_class, container)
    Object.assign(instance, data)
    this.memdb.index(container)
    return instance as T
  }

  async mixin<T extends E, E extends Doc>(obj: E, _class: Ref<Class<T>>, data: Omit<T, keyof E>): Promise<T> {
    const _id = obj._id as Ref<T>
    if (_id === undefined) {
      throw new Error('no id')
    }

    const container = this.memdb.get(_id)
    const mixins = container._mixins ?? []
    mixins.push(_class)
    container._mixins = mixins

    const instance = await this.instantiate(_class, container)
    Object.assign(instance, data)
    this.memdb.index(container)
    return instance as T
  }

  async as<T extends Doc>(doc: Layout<Doc>, _class: Ref<Class<T>>): Promise<T | undefined> {
    const layout = doc.__layout
    if (!layout)
      throw new Error('layout not found')
    const classes = layout._mixins as string[]
    if (classes && classes.includes(_class))
      return this.instantiate(_class, layout)
  }

  async createEmb<T extends Emb>(_class: Ref<Class<T>>, data: object) {
    const instance = (await this.instantiate(_class, data)) as Layout<T>
    Object.assign(instance, data)
    instance.__layout._class = _class
    return instance
  }

  async getInstance<T extends Doc>(ref: Ref<T>): Promise<T> {

    // preload Struct here

    const structProto = this.getPrototype(core.class.Struct)
    // console.log(structProto)

    const container = this.memdb.get(ref)
    return this.instantiate(container._class as Ref<Class<T>>, container)
    // const narrow = this.narrow(as, container._class)
    // if (narrow)
    //   return this.instantiate(narrow, container)
    // else
    //   throw new Error('narrow failed')
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

  async getClass<T extends Obj>(_class: Ref<Class<T>>): Promise<Class<T>> {
    return this.getInstance(_class)
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
    _attributes: DiffDescriptors<T, E>, _native?: Resource<T>): Promise<Class<T>> {
    const classClass = this.getInstance(core.class.Class as Ref<Class<Class<T>>>)
    return classClass.then(clazz =>
      clazz.newInstance({
        _id,
        _attributes,
        _extends,
        _native
      })
    )
  }

  createStruct<T extends E, E extends Obj>(
    _id: Ref<Class<T>>, _extends: Ref<Class<E>>,
    _attributes: DiffDescriptors<T, E>, _native?: Resource<T>): Promise<Class<T>> {
    const classClass = this.getInstance(core.class.Struct as Ref<Class<Class<T>>>)
    return classClass.then(clazz =>
      clazz.newInstance({
        _id,
        _attributes,
        _extends,
        _native
      })
    )
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

  // loadModel(docs: Container[]): void {
  //   this.memdb.load(docs)
  // }

  // dump(): Container[] {
  //   return this.memdb.dump()
  // }
}

