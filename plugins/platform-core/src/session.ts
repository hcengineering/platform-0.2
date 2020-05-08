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
  PropertyType, BagOf, DiffDescriptors, DocContent, Container, Session, Content
} from '.'
import { MemDb } from './memdb'
import { generateId } from './objectid'
import { objectKeys } from 'simplytyped'

type Layout<T extends Obj> = T & { __layout: any } & SessionProto

interface Konstructor<T extends Obj> {
  prototype: Object
  newInstance: (data: object) => T
}

export class TSession implements Session {

  readonly platform: Platform

  private memdb: MemDb
  private prototypes = new Map<Ref<Class<Obj>>, Object>()
  private constructors = new Map<Ref<Class<Obj>>, Konstructor<Obj>>()
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
      const attribute = attributes[key]
      const instance = this.instantiateEmbedded(attribute)
      let keyPath = key
      if (keyPrefix && !keyPath.startsWith('_'))
        keyPath = keyPrefix + ':' + key
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

  private extends<T extends Obj>(_class: Ref<Class<T>>, _extends: Ref<Class<Obj>>): boolean {
    let clazz: Ref<Class<Obj>> | undefined = _class
    while (clazz) {
      if (clazz === _extends)
        return true
      clazz = (this.memdb.get(clazz) as Pick<Class<Obj>, '_extends'>)._extends
    }
    return false
  }

  private createDocumentConstructor<T extends Obj>(_class: Ref<Class<T>>, prototype: Object): (data: object) => T {
    return data => {
      const instance = Object.create(prototype) as Layout<T>
      Object.defineProperty(instance, '_class', {
        value: _class,
        enumerable: true
      })
      const _id = (data as Content<Doc>)._id
      const container = this.memdb.get(_id, true)
      container._classes.push(_class)
      instance.__layout = container

      Object.assign(instance, data)

      return instance
    }
  }

  private createEmbeddedConstructor<T extends Obj>(_class: Ref<Class<T>>, prototype: Object): (data: object) => T {
    return data => {
      const instance = Object.create(prototype) as Layout<T>
      Object.defineProperty(instance, '_class', {
        value: _class,
        enumerable: true
      })
      instance.__layout = { _class, ...data }
      return instance
    }
  }

  private isDoc(_class: Ref<Class<Obj>>): boolean { return this.extends(_class, core.class.Doc) }

  getConstructor<T extends Obj>(_class: Ref<Class<T>>): Konstructor<T> {
    /// CLASS instance exists here!
    let ctor = this.constructors.get(_class)
    if (!ctor) {
      if (this.isDoc(_class)) {
        const prototype = this.getPrototype(_class, true)
        const newInstance = this.createDocumentConstructor(_class, prototype)
        ctor = {
          prototype,
          newInstance
        }
        this.constructors.set(_class, ctor)
      } else {
        const prototype = this.getPrototype(_class, false)
        const newInstance = this.createEmbeddedConstructor(_class, prototype)
        ctor = {
          prototype,
          newInstance
        }
        this.constructors.set(_class, ctor)
      }
    }
    return ctor as Konstructor<T>
  }

  newInstance<T extends Obj>(_class: Ref<Class<T>>, data: Content<T>): T {
    return this.getConstructor(_class).newInstance(data)
  }

  createClass<T extends E, E extends Obj>(
    _id: Ref<Class<T>>, _extends: Ref<Class<E>>,
    _attributes: DiffDescriptors<T, E>, _native?: Metadata<T>): Class<T> {
    return this.newInstance(core.class.Class as Ref<Class<Class<T>>>, {
      _id,
      _attributes,
      _extends,
      _native
    })
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

}

