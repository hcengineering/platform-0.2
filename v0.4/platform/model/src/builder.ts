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

import core, { Class, ClassifierKind, Doc, DocumentValue, DocumentValueOmit, Enum, Mixin, Model, MODEL_DOMAIN, Obj, Ref } from '@anticrm/core'
import { CombineObjects, KeysByType } from 'simplytyped'
import { collectModel, Collector } from './ts_builder'

type MethodType = (...args: any[]) => any

export type OptionalMethods<T extends Record<string, unknown>> = CombineObjects<Omit<T, KeysByType<T, MethodType>>,
Partial<Pick<T, KeysByType<T, MethodType>>>>

export type ExtractClass<T extends Obj, X extends Record<string, Ref<Class<T>>>> = {
  [P in keyof X]: X[P] extends Ref<Class<T>> ? Partial<Class<T>> : never
}

export type ExtractMixin<T extends Obj, X extends Record<string, Ref<Mixin<T>>>> = {
  [P in keyof X]: X[P] extends Ref<Mixin<T>> ? Partial<Mixin<T>> : never
}

export type ExtractEnum<T, X extends Record<string, Ref<Enum<T>>>> = {
  [P in keyof X]: X[P] extends Ref<Enum<T>> ? Partial<Enum<T>> : never
}

class Builder {
  private readonly memdb: Model

  private readonly domains = new Map<string, Model>()

  private readonly collectedIds: { [key: string]: Ref<Doc>} = {} // Contains a map of source ids to plugin reference Ids.

  private readonly collectors: {[key: string]: Collector} = {}

  private readonly postprocessing: Array<(model: Model) => void> = []

  constructor (memdb?: Model) {
    this.memdb = memdb ?? new Model(MODEL_DOMAIN)
    this.domains.set(MODEL_DOMAIN, this.memdb)
  }

  loadClass <T extends Obj, X extends Record<string, Ref<Class<T>>>>(_fileName: string, ids: X, classes: ExtractClass<T, X>, _domain?: string): void {
    this.buildClassifier<T, X>(ClassifierKind.CLASS, _fileName, ids, classes, _domain)
  }

  loadMixin <T extends Obj, X extends Record<string, Ref<Mixin<T>>>>(_fileName: string, ids: X, classes: ExtractMixin<T, X>): void {
    this.buildClassifier<T, X>(ClassifierKind.MIXIN, _fileName, ids, classes)
  }

  loadEnum <T, X extends Record<string, Ref<Enum<T>>>>(_fileName: string, ids: X, _classes: ExtractEnum<T, X>): void {
    const collector = this.collectors[_fileName] ?? collectModel(_fileName)
    this.collectors[_fileName] = collector

    for (const key in ids) {
      const id = ids[key]
      const sourceId = collector.sourceId(key)
      this.collectedIds[sourceId] = id as Ref<Enum<any>>
      const cl = collector.buildEnum(key, id as unknown as Ref<Class<Obj>>)
      this.memdb.add(cl)
    }
  }

  addPostProcess (op: (model: Model) => void): void {
    this.postprocessing.push(op)
  }

  private buildClassifier <T extends Obj, X extends Record<string, Ref<Class<T>>>>(_kind: ClassifierKind, _fileName: string, ids: X, classes: ExtractClass<T, X>, _domain?: string): void {
    const collector = this.collectors[_fileName] ?? collectModel(_fileName)
    this.collectors[_fileName] = collector

    for (const key in ids) {
      const cc = classes[key]
      if (cc._extends === undefined) {
        const id = ids[key]
        const sourceId = collector.sourceId(key)
        this.collectedIds[sourceId] = id as Ref<Class<Obj>>
      }
    }

    for (const key in ids) {
      const id = ids[key]
      const cc = classes[key]
      const cl = collector.buildClass(_kind, key, id as unknown as Ref<Class<Obj>>, cc._extends, cc._domain ?? _domain, this.collectedIds)
      this.memdb.add(cl)
    }
  }

  load (model: (builder: Builder) => void): void {
    model(this)
  }

  dump (): Doc[] {
    for (const op of this.postprocessing) {
      op(this.memdb)
    }
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
  ///

  mixin<T extends E, E extends Doc> (id: Ref<E>, clazz: Ref<Mixin<T>>, values: DocumentValueOmit<T, E>): void {
    this.memdb.mixin(id, clazz, values)
  }

  mixinDocument<T extends E, E extends Doc> (doc: E, clazz: Ref<Mixin<T>>, values: DocumentValueOmit<T, E>): void {
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
