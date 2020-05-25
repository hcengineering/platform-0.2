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

import { Platform } from '@anticrm/platform'
import core, { Session, Ref, Class, Obj, Instance, Type, Doc, Emb, EClass } from '.'
import { generateId } from './objectid'

type Konstructor<T extends Obj> = new (obj: Omit<T, '__property' | '_class'>) => Instance<T>


export class TSession implements Session {

  private readonly platform: Platform

  constructor(platform: Platform) {
    this.platform = platform
  }

  // D A T A

  objects = new Map<Ref<Doc>, Doc>()
  byClass = new Map<Ref<Class<Doc>>, Doc[]>()


  get<T extends Doc> (_id: Ref<T>): T {
    const result = this.objects.get(_id)
    if (result) { return result as T }
    throw new Error('oops! object not found: ' + _id)
  }

  private getClass (_class: Ref<Class<Obj>>): Class<Obj> {
    return this.get(_class) as Class<Obj>
  }

  // I N S T A N C E S

  private konstructors = new Map<Ref<Class<Obj>>, Konstructor<Obj>>()
  private prototypes = new Map<Ref<Class<Obj>>, Object>()

  private CoreRoot = {
    get _class (this: Instance<Obj>) { return this.__layout._class },
    getSession: (): Session => this
  }

  getPrototype<T extends Obj> (_class: Ref<Class<T>>): Object {
    const prototype = this.prototypes.get(_class)
    if (prototype) {
      return prototype
    }

    const clazz = this.getClass(_class) as Class<Obj>
    const parent = clazz._extends ? this.getPrototype(clazz._extends) : this.CoreRoot
    const proto = Object.create(parent)
    this.prototypes.set(_class, proto)

    if (clazz._native) {
      const native = this.platform.getResource(clazz._native)
      const descriptors = Object.getOwnPropertyDescriptors(native)
      Object.defineProperties(proto, descriptors)
    }

    const attributes = clazz._attributes as { [key: string]: Type<any> }
    for (const key in attributes) {
      if (key === '_default') { continue } // we do not define `_default`'s type, it's infinitevely recursive :)
      const attr = attributes[key]
      const attrInstance = this.instantiate(attr)

      if (typeof attrInstance.exert !== 'function') {
        throw new Error('exert is not a function')
      }
      const exert = attrInstance.exert()

      Object.defineProperty(proto, key, {
        get (this: Instance<Obj>) {
          return exert(Reflect.get(this.__layout, key))
        },
        enumerable: true
      })
    }
    return proto
  }

  getKonstructor<T extends Obj> (_class: Ref<Class<T>>): Konstructor<T> {
    const konstructor = this.konstructors.get(_class)
    if (konstructor) { return konstructor as unknown as Konstructor<T> }
    else {
      // build ctor for _class
      const proto = this.getPrototype(_class)
      const ctor = {
        [_class]: function (this: Instance<Obj>, obj: Obj) {
          this.__layout = obj
        }
      }[_class]
      proto.constructor = ctor
      ctor.prototype = proto
      this.konstructors.set(_class, ctor as unknown as Konstructor<Obj>)
      return ctor as unknown as Konstructor<T>
    }
  }

  instantiate<T extends Obj> (obj: T): Instance<T> {
    const ctor = this.getKonstructor(obj._class)
    return new ctor(obj)
  }

  instantiateEmb<T extends Emb> (obj: T): Instance<T> {
    return this.instantiate(obj)
  }

  instantiateDoc<T extends Doc> (obj: T): Instance<T> {
    return this.instantiate(obj)
  }

  // C O R E  A P I

  mixin<D extends T, M extends T, T extends Doc> (doc: D, clazz: Ref<EClass<M, T>>, values: Pick<M, Exclude<keyof M, keyof T>>): M {
    throw new Error("Method not implemented.")
  }

  newInstance<M extends Emb> (_class: Ref<Class<M>>, values: Omit<M, keyof Emb>): M {
    const obj = { _class, ...values } as M
    return obj
  }

  createDocument<M extends Doc> (_class: Ref<Class<M>>, values: Omit<M, keyof Doc>): M {
    const obj = { _class, _id: generateId(), ...values } as M
    this.objects.set(obj._id, obj)

    return obj
  }

  newDocument<M extends Doc> (_class: Ref<Class<M>>, values: Omit<M, keyof Doc>): Instance<M> {
    throw new Error("Method not implemented.")
    //return this.getKonstructor(_class)(this.loadDocument(_class, values))
  }

  // better API for `Class`

  createClass<T extends E, E extends Obj> (values: Omit<EClass<T, E>, keyof Obj>): EClass<T, E> {
    return this.createDocument(core.class.Class as Ref<Class<EClass<T, E>>>, values)
  }

  newClass<T extends E, E extends Obj> (values: Omit<EClass<T, E>, keyof Obj>): Instance<EClass<T, E>> {
    return this.newDocument(core.class.Class as Ref<Class<EClass<T, E>>>, values)
  }
}