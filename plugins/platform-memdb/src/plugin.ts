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
import { Session, Obj, Ref, Class, Doc, EClass, Instance, Type, PropertyType, Emb } from '.'


type Konstructor<T extends Obj> = (obj: T) => Instance<T>

class Tx implements Session {

  private objects = new Map<Ref<Doc>, Doc>()
  private byClass = new Map<Ref<Class<Doc>>, Doc[]>()


  get<T extends Doc> (_id: Ref<T>): T {
    return this.objects.get(_id) as T
  }

  /////

  private konstructors = new Map<Ref<Class<Obj>>, Konstructor<Obj>>()

  getKonstructor<T extends Doc> (_class: Ref<Class<T>>): Konstructor<T> {
    const konstructor = this.konstructors.get(_class)
    if (konstructor) { return konstructor as unknown as Konstructor<T> }
    else {
      const clazz = this.get(_class) as Class<Obj>
      const attributes = clazz._attributes as { [key: string]: Type<PropertyType> }
      for (const key in attributes) {
        const attr = attributes[key]
        attr.
      }
    }
    return {} as Konstructor<T>
  }

  // S E S S I O N  A P I

  mixin<D extends T, M extends T, T extends Doc> (doc: D, clazz: Ref<EClass<M, T>>, values: Pick<M, Exclude<keyof M, keyof T>>): M {
    throw new Error("Method not implemented.")
  }

  newInstance<M extends Emb> (clazz: Ref<Class<M>>, values: Omit<M, keyof Emb>): M {
    throw new Error("Method not implemented.")
  }

  newDocument<M extends Doc> (_class: Ref<Class<M>>, values: Omit<M, keyof Doc>): Instance<M> {
    const _id = '' as Ref<M>
    const instance = { _class, _id, ...values } as M
    this.objects.set(_id, instance)

    return this.getKonstructor(_class)(instance)
  }

  newClass<T extends E, E extends Obj> (values: Pick<EClass<T, E>, "_id" | "_mixins" | "_attributes">): EClass<T, E> {
    throw new Error("Method not implemented.")
  }

}


export default async (platform: Platform): Promise<Session> => {
  return new Tx()
}