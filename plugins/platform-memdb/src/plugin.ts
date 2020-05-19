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
import core, {
  CoreService, Obj, Ref, Class, Doc, EClass,
  Instance, Type, Emb, ResourceType, Property
} from '.'

type Konstructor<T extends Obj> = new (obj: Omit<T, '__property' | '_class'>) => Instance<T>

interface InstanceProxy {
  __layout: any
}

const identity = function (val: Property<any>): any {
  return val ?? identity
}

export class Tx implements CoreService {

  private objects = new Map<Ref<Doc>, Doc>()
  private byClass = new Map<Ref<Class<Doc>>, Doc[]>()


  get<T extends Doc> (_id: Ref<T>): T {
    const result = this.objects.get(_id)
    if (result) { return result as T }
    throw new Error('oops! object not found: ' + _id)
  }

  /// C L A S S E S

  getOwnAttribute (clazz: Class<Obj>, key: string): Type<any> | undefined {
    return (clazz._attributes as any)[key] ??
      (clazz._overrides ? (clazz._overrides as any)[key] : undefined)
  }

  getAttribute (clazz: Class<Obj>, key: string): Type<any> | undefined {
    return this.getOwnAttribute(clazz, key) ??
      (clazz._extends ? this.getAttribute(this.get(clazz._extends), key) : undefined)
  }

  ///// I N S A N T I A T I O N

  private konstructors = new Map<Ref<Class<Obj>>, Konstructor<Obj>>()
  private prototypes = new Map<Ref<Class<Obj>>, Object>()

  getPrototype<T extends Obj> (_class: Ref<Class<T>>): Object {
    // console.log('requesting prototype for ' + _class)
    const prototype = this.prototypes.get(_class)
    if (prototype) {
      // console.log('cached proto: ')
      // console.log(prototype)
      return prototype
    }


    const clazz = this.get(_class) as Class<Obj>
    const parent = clazz._extends ? this.getPrototype(clazz._extends) : Object.prototype
    // console.log('parent for ' + _class)
    // console.log(parent)
    const proto = Object.create(parent)
    this.prototypes.set(_class, proto)

    // console.log('constructing prototype ' + _class)

    if (_class as string === core.class.ResourceType) {
      proto.exert = identity
    }
    const attributes: { [key: string]: Type<any> } = { ...clazz._attributes, ...clazz._overrides }
    for (const key in attributes) {
      const attr = attributes[key]
      const attrInstance = this.instantiate(attr)

      let exert = attrInstance.exert as (value: Property<any>) => any
      if (!exert) {
        console.log('no exert for ' + _class + '[' + key + ']')
        if (key === '_default') {
          console.log('skip _default')
          continue
        }
        console.log(attrInstance)

        // console.log('default: ' + attrInstance._default)
        // const dflt = attrInstance._default
        // if (dflt === 'identity' || key === '_default' || _class === core.class.RefTo as string) {
        //   exert = function (this: Type<any>, val: Property<any>): any {
        //     return val ?? this._default
        //   }
        // } else {
        //   console.log(attrInstance)
        //   const p1 = Object.getPrototypeOf(attrInstance)
        //   console.log(p1)
        //   console.log(Object.getPrototypeOf(p1))
        //   throw new Error("No excert")
        // }
        throw new Error('no excert')
      }
      if (typeof exert !== 'function') {
        throw new Error('exert must be a function, ' + exert)
      }
      const e = exert.bind(attrInstance)
      Object.defineProperty(proto, key, {
        get (this: InstanceProxy) {
          return e(this.__layout[key])
        },
        enumerable: true
      })
    }
    console.log('constructed prototype ' + _class)
    console.log(proto)
    console.log('parent')
    console.log(parent)
    return proto
  }

  getKonstructor<T extends Obj> (_class: Ref<Class<T>>): Konstructor<T> {
    const konstructor = this.konstructors.get(_class)
    if (konstructor) { return konstructor as unknown as Konstructor<T> }
    else {
      // build ctor for _class
      const proto = this.getPrototype(_class)
      const ctor = {
        [_class]: function (this: InstanceProxy, obj: Obj) {
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

  // C O R E  A P I

  mixin<D extends T, M extends T, T extends Doc> (doc: D, clazz: Ref<EClass<M, T>>, values: Pick<M, Exclude<keyof M, keyof T>>): M {
    throw new Error("Method not implemented.")
  }

  newInstance<M extends Emb> (_class: Ref<Class<M>>, values: Omit<M, keyof Emb>): M {
    const obj = { _class, ...values } as M
    return obj
  }

  loadDocument<M extends Doc> (_class: Ref<Class<M>>, values: Omit<M, keyof Doc>): M {
    const obj = { _class, ...values } as M
    this.objects.set(obj._id, obj)

    return obj
  }

  newDocument<M extends Doc> (_class: Ref<Class<M>>, values: Omit<M, keyof Doc>): Instance<M> {
    throw new Error("Method not implemented.")
    //return this.getKonstructor(_class)(this.loadDocument(_class, values))
  }

  loadClass<T extends E, E extends Obj> (values: Omit<EClass<T, E>, keyof Obj>): EClass<T, E> {
    return this.loadDocument(core.class.Class as Ref<Class<EClass<T, E>>>, values)
  }

  newClass<T extends E, E extends Obj> (values: Omit<EClass<T, E>, keyof Obj>): Instance<EClass<T, E>> {
    return this.newDocument(core.class.Class as Ref<Class<EClass<T, E>>>, values)
  }

}

export default async (platform: Platform): Promise<CoreService> => {
  return new Tx()
}

