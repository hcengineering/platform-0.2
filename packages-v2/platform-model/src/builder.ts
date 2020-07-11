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
  Class,
  CoreDomain,
  Doc,
  EClass,
  Emb,
  Layout,
  MemDb,
  Obj,
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

  load(model: (builder: Builder) => void) {
    model(this)
  }

  dump(): Layout<Doc>[] {
    return this.memdb.dump()
  }

  dumpAll(): { [key: string]: Layout<Doc>[] } {
    const result = {} as { [key: string]: Layout<Doc>[] }
    for (const e of this.domains) {
      result[e[0]] = e[1].dump()
    }
    result[CoreDomain.Model] = this.memdb.dump()
    return result
  }

  getDomain(domain: string) {
    const memdb = this.domains.get(domain)
    if (!memdb) {
      const memdb = new MemDb(domain)
      this.domains.set(domain, memdb)
      return memdb
    }
    return memdb
  }

  ///

  newInstance<M extends Emb>(_class: Ref<Class<M>>, values: Layout<Omit<M, keyof Emb>>): Layout<M> {
    const obj = {_class: _class as Ref<Class<Obj>>, ...values} as Layout<M>
    return obj
  }

  createDocument<M extends Doc>(_class: Ref<Class<M>>, values: Layout<Omit<M, keyof Doc>>, _id?: Ref<M>): void {
    this.memdb.createDocument(_class, values, _id)
  }

  createClass<T extends E, E extends Obj>(_id: Ref<Class<T>>, _extends: Ref<Class<E>>, _attributes: AllAttributes<T, E>, _domain?: string, _native?: Resource<any>) {
    this.createDocument(core.class.Class as Ref<Class<EClass<T, E>>>,
      {_extends, _attributes, _domain, _native} as unknown as Layout<EClass<T, E>>,
      _id as Ref<EClass<T, E>>)
  }
}

export default Builder
