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
import { Session, Obj, Ref, Class, Doc, EClass } from '.'


class Tx implements Session {

  private objects = new Map<Ref<Doc>, Doc>()
  private byClass = new Map<Ref<Class<Doc>>, Doc[]>()

  mixin<D extends T, M extends T, T extends Doc> (doc: D, clazz: Ref<EClass<M, T>>, values: Pick<M, Exclude<keyof M, keyof T>>): M {
    throw new Error("Method not implemented.")
  }
  newInstance<M extends Obj> (clazz: Ref<Class<M>>, values: Pick<M, Exclude<keyof M, "_class">>): M {
    throw new Error("Method not implemented.")
  }

  newDocument<M extends Doc> (_class: Ref<Class<M>>, values: Omit<M, keyof Doc>): M {
    const _id = '' as Ref<M>
    const instance = { _class, _id, ...values } as M
    this.objects.set(_id, instance)

    return instance
  }

  newClass<T extends E, E extends Obj> (values: Pick<EClass<T, E>, "_id" | "_mixins" | "_attributes">): EClass<T, E> {
    throw new Error("Method not implemented.")
  }

}


export default async (platform: Platform): Promise<Session> => {
  return new Tx()
}