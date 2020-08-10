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
  CoreDomain,
  Doc,
  EClass,
  Emb,
  MemDb,
  Mixin,
  Obj,
  OptionalMethods,
  Ref,
  Resource
} from '@anticrm/platform'
import core from '.'

class Builder {
  private memdb: MemDb

  private domains = new Map<string, MemDb>()

  constructor(memdb?: MemDb) {
    this.memdb = memdb ?? new MemDb(CoreDomain.Model)
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
    result[CoreDomain.Model] = this.memdb.dump()
    return result
  }

  getDomain (domain: string) {
    const memdb = this.domains.get(domain)
    if (!memdb) {
      const memdb = new MemDb(domain)
      this.domains.set(domain, memdb)
      return memdb
    }
    return memdb
  }

  ///

  mixin<T extends E, E extends Doc> (id: Ref<E>, clazz: Ref<Mixin<T>>, values: Omit<T, keyof E>): void {
    this.memdb.mixin(id, clazz, values)
  }

  newInstance<M extends Emb> (_class: Ref<Class<M>>, values: OptionalMethods<Omit<M, keyof Emb>>): M {
    const obj = { _class: _class as Ref<Class<Obj>>, ...values } as M
    return obj
  }

  attr<M extends Emb> (_class: Ref<Class<M>>, values: OptionalMethods<Omit<M, keyof Emb>>): Attribute {
    const type = { _class: _class as Ref<Class<Obj>>, ...values } as M
    return { _class: core.class.Attribute, type } as unknown as Attribute
  }

  createDocument<M extends Doc> (_class: Ref<Class<M>>, values: Omit<M, keyof Doc>, _id?: Ref<M>): void {
    this.memdb.createDocument(_class, values, _id)
  }

  // createCls<T extends E, E extends Obj> (_id: Ref<Class<T>>, _extends: Ref<Class<E>>, values: Omit<Class<T>, keyof Classifier<Obj>>, _attributes: AllAttributes<T, E>) {
  //   this.createDocument(core.class.Class as Ref<Class<Class<T>>>, {
  //     _extends,
  //     _attributes,
  //     ...values
  //   } as unknown as Class<T>, _id as Ref<Class<T>>)
  // }

  createClass<T extends E, E extends Obj> (_id: Ref<Class<T>>, _extends: Ref<Class<E>>, _attributes: AllAttributes<T, E>, _domain?: string, _native?: Resource<any>) {
    this.createDocument(core.class.Class as Ref<Class<EClass<T, E>>>,
      { _extends, _attributes, _domain, _native, _kind: ClassifierKind.CLASS } as EClass<T, E>,
      _id as Ref<EClass<T, E>>)
  }

  createMixin<T extends E, E extends Doc> (_id: Ref<Mixin<T>>, _extends: Ref<Class<E>>, _attributes: AllAttributes<T, E>, _domain?: string, _native?: Resource<any>) {
    this.createDocument(core.class.Class as Ref<Class<EClass<T, E>>>,
      { _extends, _attributes, _domain, _native, _kind: ClassifierKind.MIXIN } as EClass<T, E>,
      _id as Ref<EClass<T, E>>)
  }
}

export default Builder
