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

import { Resource } from '@anticrm/platform'

import { loadClassifier } from './dsl'
import { CombineObjects, KeysByType } from 'simplytyped'
import {
  AllAttributes, Attribute, Class, ClassifierKind, Doc, EClass, Emb, Mixin, Model, MODEL_DOMAIN, Obj, Ref,
  StringProperty
} from '@anticrm/core'
import core from '.'

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
    const result = {} as { [key: string]: Doc[] }
    for (const e of this.domains) {
      result[e[0]] = e[1].dump()
    }
    // result[CoreDomain.Model] = this.memdb.dump()
    return result
  }

  getDomain (domain: string): Model {
    const memdb = this.domains.get(domain)
    if (!memdb) {
      const memdb = new Model(domain)
      this.domains.set(domain, memdb)
      return memdb
    }
    return memdb
  }

  add (...classes: { new (): Obj }[]): void {
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

  newInstance<M extends Emb> (_class: Ref<Class<M>>, values: OptionalMethods<Omit<M, keyof Emb>>): M {
    return { _class: _class as Ref<Class<Obj>>, ...values } as M
  }

  attr<M extends Emb> (_class: Ref<Class<M>>, values: OptionalMethods<Omit<M, keyof Emb>>): Attribute {
    const type = { _class: _class as Ref<Class<Obj>>, ...values } as M
    return { _class: core.class.Attribute, type } as unknown as Attribute
  }

  createDocument<M extends Doc> (_class: Ref<Class<M>>, values: Omit<M, keyof Doc>, _id?: Ref<M>): M {
    const doc = this.memdb.createDocument(_class, values, _id)
    if (_class === core.class.Class as Ref<Class<Doc>> || _class === core.class.Mixin as Ref<Class<Doc>>) {
      this.memdb.add(doc)
      console.log('add `model` ' + doc._id)
    } else {
      const domain = this.memdb.getDomain(_class)
      if (!domain) {
        throw new Error('domain not found for class: ' + _class)
      }
      console.log(`add '${domain}' ` + doc._id)
      this.getDomain(domain).add(doc)
    }
    return doc as M
  }

  createClass<T extends E, E extends Obj> (_id: Ref<Class<T>>, _extends: Ref<Class<E>>, _attributes: AllAttributes<T, E>, _domain?: string, _native?: Resource<any>): EClass<T, E> {
    const _eclass: EClass<T, E> = {
      _id,
      _class: core.class.Class,
      _extends,
      _domain: _domain as StringProperty,
      _native: (_native as string) as StringProperty,
      _attributes,
      _kind: ClassifierKind.CLASS
    }
    return this.createDocument(core.class.Class as Ref<Class<EClass<T, E>>>,
      _eclass,
      _id as Ref<EClass<T, E>>)
  }

  createMixin<T extends E, E extends Doc> (_id: Ref<Mixin<T>>, _extends: Ref<Class<E>>, _attributes: AllAttributes<T, E>, _domain?: string, _native?: Resource<any>): EClass<T, E> {
    const _eclass: EClass<T, E> = {
      _id,
      _class: core.class.Mixin,
      _extends,
      _attributes,
      _domain: _domain as StringProperty,
      _native: (_native as string) as StringProperty,
      _kind: ClassifierKind.MIXIN
    }
    return this.createDocument(core.class.Mixin as Ref<Class<EClass<T, E>>>,
      _eclass,
      _id as Ref<EClass<T, E>>)
  }
}

export default Builder
