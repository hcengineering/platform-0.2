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

import {
  AllAttributes,
  Attribute,
  Class,
  Classifier,
  ClassifierKind,
  Doc,
  EClass,
  Emb,
  Mixin,
  Obj,
  Ref,
  Model,
  MODEL_DOMAIN,
  CORE_CLASS_ATTRIBUTE,
  CORE_CLASS_CLASS,
  CORE_CLASS_MIXIN
} from '@anticrm/core'

import { Resource } from '@anticrm/platform'

import { getClassifier } from './dsl'
import { CombineObjects, KeysByType } from 'simplytyped'

type MethodType = (...args: any[]) => any

export type OptionalMethods<T extends object> = CombineObjects<Omit<T, KeysByType<T, MethodType>>,
  Partial<Pick<T, KeysByType<T, MethodType>>>>

class Builder {
  private memdb: Model

  private domains = new Map<string, Model>()

  constructor(memdb?: Model) {
    this.memdb = memdb ?? new Model(MODEL_DOMAIN)
    this.domains.set(MODEL_DOMAIN, this.memdb)
  }

  load (model: (builder: Builder) => void) {
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

  getDomain (domain: string) {
    const memdb = this.domains.get(domain)
    if (!memdb) {
      const memdb = new Model(domain)
      this.domains.set(domain, memdb)
      return memdb
    }
    return memdb
  }

  add (...classes: { new(): Obj }[]) {
    for (const ctor of classes) {
      const classifier = getClassifier(ctor.prototype)
      console.log('classifier', classifier)
      this.memdb.add(classifier)
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
    const obj = { _class: _class as Ref<Class<Obj>>, ...values } as M
    return obj
  }

  attr<M extends Emb> (_class: Ref<Class<M>>, values: OptionalMethods<Omit<M, keyof Emb>>): Attribute {
    const type = { _class: _class as Ref<Class<Obj>>, ...values } as M
    return { _class: CORE_CLASS_ATTRIBUTE, type } as unknown as Attribute
  }

  createDocument<M extends Doc> (_class: Ref<Class<M>>, values: Omit<M, keyof Doc>, _id?: Ref<M>): M {
    const doc = this.memdb.createDocument(_class, values, _id)
    if (_class === CORE_CLASS_CLASS as Ref<Class<Doc>> || _class === CORE_CLASS_MIXIN as Ref<Class<Doc>>) {
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

  // createCls<T extends E, E extends Obj> (_id: Ref<Class<T>>, _extends: Ref<Class<E>>, values: Omit<Class<T>, keyof Classifier<Obj>>, _attributes: AllAttributes<T, E>) {
  //   this.createDocument(core.class.Class as Ref<Class<Class<T>>>, {
  //     _extends,
  //     _attributes,
  //     ...values
  //   } as unknown as Class<T>, _id as Ref<Class<T>>)
  // }

  createClass<T extends E, E extends Obj> (_id: Ref<Class<T>>, _extends: Ref<Class<E>>, _attributes: AllAttributes<T, E>, _domain?: string, _native?: Resource<any>) {
    this.createDocument(CORE_CLASS_CLASS as Ref<Class<EClass<T, E>>>,
      { _extends, _attributes, _domain, _native, _kind: ClassifierKind.CLASS } as EClass<T, E>,
      _id as Ref<EClass<T, E>>)
  }

  createMixin<T extends E, E extends Doc> (_id: Ref<Mixin<T>>, _extends: Ref<Class<E>>, _attributes: AllAttributes<T, E>, _domain?: string, _native?: Resource<any>) {
    this.createDocument(CORE_CLASS_MIXIN as Ref<Class<EClass<T, E>>>,
      { _extends, _attributes, _domain, _native, _kind: ClassifierKind.MIXIN } as EClass<T, E>,
      _id as Ref<EClass<T, E>>)
  }
}

export default Builder
