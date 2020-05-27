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

import { PropertyType, Emb, Doc, Obj, Ref, EClass, Class, AllAttributes } from '@anticrm/platform-core'
import core from '.'

type Layout = { [key: string]: PropertyType }

function attributeKey (_class: Ref<Class<Obj>>, key: string): string {
  const index = _class.indexOf(':')
  return _class.substring(index + 1) + '/' + key
}

class Builder {

  private objects = new Map<Ref<Doc>, Doc>()

  protected add (doc: Doc) {
    const id = doc._id
    if (this.objects.get(id)) { throw new Error('document added already ' + id) }
    this.objects.set(id, doc)
  }

  protected get<T extends Doc> (id: Ref<T>): T {
    const obj = this.objects.get(id)
    if (!obj) { throw new Error('document not found ' + id) }
    return obj as T
  }

  dump () {
    const result = []
    for (const doc of this.objects.values()) {
      result.push(doc)
    }
    return result
  }

  /// A S S I G N

  private findAttributeKey<T extends Doc> (cls: Ref<Class<T>>, key: string): string {
    let _class = cls as Ref<Class<Obj>> | undefined
    const result = [] as [string, string][]
    while (_class) {
      const clazz = this.get(_class)
      if ((clazz._attributes as any)[key] !== undefined) {
        return attributeKey(_class, key)
      }
      _class = clazz._extends
    }
    throw new Error('attribute not found: ' + key)
  }

  protected assign<T extends E, E extends Doc> (doc: E, _class: Ref<Class<T>>, _extends: Ref<Class<E>>, val: Omit<T, keyof E>) {
    const layout = doc as unknown as Layout
    const values = val as unknown as Layout
    for (const key in values) {
      if (key.startsWith('_')) {
        layout[key] = values[key]
      } else {
        layout[this.findAttributeKey(_class, key)] = values[key]
      }
    }
  }

  // N E W  I N S T A N C E S

  createClass<T extends E, E extends Obj> (_id: Ref<Class<T>>, _extends: Ref<Class<E>>, _attributes: AllAttributes<T, E>) {
    this.createDocument(core.class.Class as Ref<Class<EClass<T, E>>>, { _extends, _attributes }, _id as Ref<EClass<T, E>>)
  }

  newInstance<M extends Emb> (_class: Ref<Class<M>>, values: Omit<M, keyof Emb>): M {
    const obj = { _class, ...values } as M
    return obj
  }

  createDocument<M extends Doc> (_class: Ref<Class<M>>, values: Omit<M, keyof Doc>, _id: Ref<M>) {
    const layout = { _class, _id } as Doc
    this.assign(layout, _class, core.class.Doc, values)
    this.add(layout as Doc)
  }

  mixin<T extends E, E extends Doc> (id: Ref<E>, clazz: Ref<Class<T>>, values: Pick<T, Exclude<keyof T, keyof E>>) {
    const doc = this.get(id)
    if (!doc._mixins) { doc._mixins = [] }
    doc._mixins.push(clazz as Ref<Class<Doc>>)
    const docClass = doc._class
    this.assign(doc, clazz, docClass, values)
  }

  patch<T extends Doc> (obj: Ref<T>, f: (obj: T) => void) {
    f(this.get(obj))
  }

  load (model: (builder: Builder) => void) { model(this) }

}

export default Builder
