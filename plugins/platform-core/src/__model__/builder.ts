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

import { Session, Emb, Doc, Obj, Ref, EClass, Class, AllAttributes } from '@anticrm/platform-core'
import core from '.'

class Builder {

  private objects = new Map<Ref<Doc>, Doc>()

  protected add (doc: Doc) {
    const id = doc._id
    if (this.objects.get(id)) { throw new Error('document added already ' + id) }
    this.objects.set(id, doc)
  }

  createStruct<T extends E, E extends Obj> (_id: Ref<Class<T>>, _extends: Ref<Class<E>>, _attributes: AllAttributes<T, E>): EClass<T, E> {
    return this.createClass<T, E>({ _id, _extends, _attributes })
  }

  newInstance<M extends Emb> (_class: Ref<Class<M>>, values: Omit<M, keyof Emb>): M {
    const obj = { _class, ...values } as M
    return obj
  }

  createDocument<M extends Doc> (_class: Ref<Class<M>>, values: Omit<M, keyof Obj>): M {
    const obj = { _class, ...values } as M
    this.add(obj)
    return obj
  }

  createClass<T extends E, E extends Obj> (values: Omit<EClass<T, E>, keyof Obj>): EClass<T, E> {
    return this.createDocument(core.class.Class as Ref<Class<EClass<T, E>>>, values)
  }

  load (model: (builder: Builder) => Doc[]) {
    const docs = model(this)
    for (const doc of docs) {
      this.add(doc)
    }
  }

}

export default Builder
