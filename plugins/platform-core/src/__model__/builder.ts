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

import { Resource, Metadata, Emb, Doc, Obj, Ref, EClass, Class, AllAttributes, Property } from '@anticrm/platform'

import { CreateTx, VDoc, RefTo, InstanceOf, ArrayOf, Type, CoreDomain } from '..'
import { MemDb, Layout } from '@anticrm/memdb'
import core from '.'

class Builder {
  private memdb: MemDb

  private domains = new Map<string, MemDb>()

  constructor (memdb?: MemDb) {
    this.memdb = memdb ?? new MemDb()
  }

  dump (): Layout<Doc>[] {
    return this.memdb.dump()
  }

  dumpAll (): { [key: string]: Layout<Doc>[] } {
    const result = {} as { [key: string]: Layout<Doc>[] }
    for (const e of this.domains) {
      result[e[0]] = e[1].dump()
    }
    result[CoreDomain.Model] = this.memdb.dump()
    return result
  }

  getDomain (domain: string) {
    const memdb = this.domains.get(domain)
    if (!memdb) {
      const memdb = new MemDb()
      this.domains.set(domain, memdb)
      return memdb
    }
    return memdb
  }

  // N E W  I N S T A N C E S

  createClass<T extends E, E extends Obj> (_id: Ref<Class<T>>, _extends: Ref<Class<E>>, _attributes: AllAttributes<T, E>, _domain?: string, _native?: Resource<any>) {
    this.createDocument(core.class.Class as Ref<Class<EClass<T, E>>>,
      { _extends, _attributes, _domain, _native } as Layout<EClass<T, E>>,
      _id as Ref<EClass<T, E>>)
  }

  newInstance<M extends Emb> (_class: Ref<Class<M>>, values: Omit<M, keyof Emb>): M {
    const obj = { _class: _class as Ref<Class<Obj>>, ...values } as M
    return obj
  }

  createDocument<M extends Doc> (_class: Ref<Class<M>>, values: Layout<Omit<M, keyof Doc>>, _id?: Ref<M>): void {
    this.memdb.createDocument(_class, values, _id)
  }

  createVDocument<M extends VDoc> (_class: Ref<Class<M>>, values: Layout<Omit<M, keyof VDoc>>, user: string, _id?: Ref<M>) {
    const date = Date.now()
    const clazz = this.memdb.get(_class) as Layout<Class<VDoc>>
    const id = _id ?? this.memdb.generateId()
    const layout: Layout<VDoc> = {
      _class,
      _id: id,
      _createdOn: date,
      _createdBy: user
    }
    this.memdb.assign(layout as Layout<M>, _class, values)
    this.getDomain(clazz._domain as string).add(layout)

    // Create Tx
    const attributes = {}
    this.memdb.assign(attributes as Layout<M>, _class, values)

    const txLayout: Layout<CreateTx> = {
      _class: core.class.CreateTx,
      _id: this.memdb.generateId(),
      _date: date,
      _user: user,
      _objectId: id as Ref<VDoc>,
      _objectClass: _class,
      _attributes: attributes
    }
    this.getDomain(CoreDomain.Tx).add(txLayout)
  }

  mixin<T extends E, E extends Doc> (id: Ref<E>, clazz: Ref<Class<T>>, values: Layout<Omit<T, keyof E>>) {
    this.memdb.mixin(id, clazz, values)
  }

  load (model: (builder: Builder) => void) { model(this) }

  resolve<T> (resource: Resource<T>) {
    return resource as Resource<T> & Property<Promise<T>>
  }

  resolveMeta<T> (resource: Metadata<T>) {
    return resource as Metadata<T> & Property<T>
  }

  primitive<T> (prop: T) {
    return prop as T & Property<T>
  }

  // H E L P E R S

  ref<T extends Doc> (to: Ref<Class<T>>): RefTo<T> {
    return this.newInstance(core.class.RefTo, { to: to as Ref<Class<Doc>> }) as RefTo<T>
  }

  arrayOf<T> (of: Type<T>): ArrayOf<T> {
    return this.newInstance(core.class.ArrayOf, { of })
  }

  instanceOf<T extends Emb> (of: Ref<Class<T>>): InstanceOf<T> {
    return this.newInstance(core.class.InstanceOf as Ref<Class<InstanceOf<T>>>, { of })
  }
}

export default Builder
