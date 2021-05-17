//
// Copyright © 2020, 2021 Anticrm Platform Contributors.
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

import core, {
  Class, Doc, DocumentValue, Mixin, Model, MODEL_DOMAIN,
  Obj, Ref
} from '@anticrm/core'
import { CombineObjects, KeysByType } from 'simplytyped'
import { loadClassifier } from './dsl'

type MethodType = (...args: any[]) => any

export type OptionalMethods<T extends Record<string, unknown>> = CombineObjects<Omit<T, KeysByType<T, MethodType>>,
Partial<Pick<T, KeysByType<T, MethodType>>>>

class Builder {
  private readonly memdb: Model

  private readonly domains = new Map<string, Model>()

  constructor (memdb?: Model) {
    this.memdb = memdb ?? new Model(MODEL_DOMAIN)
    this.domains.set(MODEL_DOMAIN, this.memdb)
  }

  load (model: (builder: Builder) => void): void {
    model(this)
  }

  dump (): Doc[] {
    return this.memdb.dump()
  }

  dumpAll (): { [key: string]: Doc[] } {
    const result: { [key: string]: Doc[] } = {}
    for (const e of this.domains) {
      result[e[0]] = e[1].dump()
    }
    return result
  }

  getDomain (domain: string): Model {
    const memdb = this.domains.get(domain)
    if (memdb === undefined) {
      const memdb = new Model(domain)
      this.domains.set(domain, memdb)
      return memdb
    }
    return memdb
  }

  add (...classes: Array<new () => Obj>): void {
    for (const ctor of classes) {
      const classifier = loadClassifier(ctor.prototype)
      this.memdb.add(classifier.doc)
    }
    for (const ctor of classes) {
      const classifier = loadClassifier(ctor.prototype)
      if (classifier.postProcessing.length > 0) {
        for (const op of classifier.postProcessing) {
          // We use modelDB to find core stuff.
          op(this.memdb, classifier.doc)
        }
      }
    }
  }

  ///

  mixin<T extends E, E extends Doc> (id: Ref<E>, clazz: Ref<Mixin<T>>, values: Omit<T, keyof E>): void {
    this.memdb.mixin(id, clazz, values)
  }

  mixinDocument<T extends E, E extends Doc> (doc: E, clazz: Ref<Mixin<T>>, values: Omit<T, keyof E>): void {
    this.memdb.mixinDocument(doc, clazz, values)
  }

  createDocument<M extends Doc> (_class: Ref<Class<M>>, values: DocumentValue<M>, _id?: Ref<M>): M {
    const doc = this.memdb.createDocument<M>(_class, values, _id)
    if (_class === core.class.Class as Ref<Class<Doc>> || _class === core.class.Mixin as Ref<Class<Doc>>) {
      this.memdb.add(doc)
      console.log('add `model` ' + doc._id)
    } else {
      const domain = this.memdb.getDomain(_class)
      if (domain === undefined) {
        throw new Error('domain not found for class: ' + _class)
      }
      console.log(`add '${domain}' ` + doc._id)
      this.getDomain(domain).add(doc)
    }
    return doc
  }
}

export default Builder
