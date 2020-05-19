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

interface InstanceProxy {
  __tx: Tx
  __layout: Obj
  __class: Class<Obj>
}

class InstanceProxyHandler implements ProxyHandler<InstanceProxy> {
  get (target: InstanceProxy, key: string, receiver: any): any {
    if (key.startsWith('__')) {
      return Reflect.get(target, key)
    } else {
      const attr = target.__tx.getAttribute(target.__class, key)
      if (!attr) {
        throw new Error('attribute not found: ' + target.__class._id + ' ' + key)
      }
      const instance = target.__tx.instantiate(attr)
      if (!instance.exert) {
        console.log('getting ' + key)
        console.log(target)
        console.log(attr)
        console.log(instance)

        throw new Error('exert is not defined')
      }
      return instance.exert(Reflect.get(target.__layout, key))
    }
  }
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
    // console.log('getOwnAttribute: ' + key)
    // console.log(clazz)
    return (clazz._attributes as any)[key]
  }

  getAttribute (clazz: Class<Obj>, key: string): Type<any> | undefined {
    return this.getOwnAttribute(clazz, key) ??
      (clazz._extends ? this.getAttribute(this.get(clazz._extends), key) : undefined)
  }

  ///// I N S A N T I A T I O N

  instantiate<T extends Obj> (obj: T): Instance<T> {
    // console.log('instantiating: ')
    // console.log(obj)

    if (obj._class as string === core.class.Identity) {
      return {
        __layout: obj,
        exert (this: { __layout: any }, value: Property<any>): any {
          // console.log('EXEEEEERRT:')
          // console.log(value)
          // console.log(this.__layout)
          return value
        }
      } as unknown as Instance<T>
    }

    return new Proxy({
      __tx: this,
      __layout: obj,
      __class: this.get(obj._class)
    }, new InstanceProxyHandler()) as unknown as Instance<T>
    // return this.getKonstructor(obj._class)(obj)
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

  // private konstructors = new Map<Ref<Class<Obj>>, Konstructor<Obj>>()

  // getKonstructor<T extends Obj> (_class: Ref<Class<T>>): Konstructor<T> {
  //   console.log('need constructor for ' + _class)
  //   const konstructor = this.konstructors.get(_class)
  //   if (konstructor) { return konstructor as unknown as Konstructor<T> }
  //   else {
  //     const clazz = this.get(_class) as Class<Obj>
  //     const attributes = clazz._attributes as { [key: string]: Type<any> }
  //     for (const key in attributes) {
  //       const attr = attributes[key]
  //       const attrInstance = this.instantiate(attr)
  //       attrInstance.exert
  //       const exert = attrInstance.exert
  //     }
  //   }
  //   return {} as Konstructor<T>
  // }

  // C O R E  A P I

  // instantiate<T extends Obj> (obj: T): Instance<T> {
  //   return this.getKonstructor(obj._class)(obj)
  // }
