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

import { Resource, Metadata } from '@anticrm/platform'
import { Session, Doc, Ref, Emb, Class, DiffDescriptors, Type, PropertyType, BagOf, InstanceOf, Obj } from '..'
import core from '.'

class CoreBuilder implements Session {
  protected session: Session

  constructor (session: Session) {
    this.session = session
  }

  async resource<T> (): Promise<Type<Resource<T>>> {
    const meta = await this.session.getClass(core.class.Resource)
    return meta.newInstance({})
  }

  async metadata<T> (): Promise<Type<Metadata<T>>> {
    const meta = await this.session.getClass(core.class.Metadata)
    return meta.newInstance({})
  }

  async string (): Promise<Type<string>> {
    const type = await this.session.getClass(core.class.Type as Ref<Class<Type<string>>>)
    return type.newInstance({})
  }

  async bag<T extends PropertyType> (of: Type<T>): Promise<BagOf<T>> {
    const bagOf = await this.session.getClass(core.class.BagOf)
    return bagOf.newInstance({ of }) as Promise<BagOf<T>>
  }

  async struct<T extends Emb> (of: Ref<Class<T>>): Promise<InstanceOf<T>> {
    const instanceOf = await this.session.getClass(core.class.InstanceOf)
    return instanceOf.newInstance({ of }) as Promise<InstanceOf<T>>
  }

  getClass<T extends Obj> (_class: Ref<Class<T>>): Promise<Class<T>> {
    return this.session.getClass(_class)
  }

  mixin<T extends E, E extends Doc> (obj: E, _class: Ref<Class<T>>, data: Omit<T, keyof E>): Promise<T> {
    return this.session.mixin(obj, _class, data)
  }

  createClass<T extends E, E extends Doc> (
    _id: Ref<Class<T>>, _extends: Ref<Class<E>>,
    _attributes: DiffDescriptors<T, E>, _native?: Resource<T>): Promise<Class<T>> {
    return this.session.createClass(_id, _extends, _attributes, _native)
  }

  createStruct<T extends E, E extends Emb> (
    _id: Ref<Class<T>>, _extends: Ref<Class<E>>,
    _attributes: DiffDescriptors<T, E>, _native?: Resource<T>): Promise<Class<T>> {
    return this.session.createStruct(_id, _extends, _attributes, _native)
  }

  getInstance<T extends Doc> (): Promise<T> {
    throw new Error('Method not implemented.')
  }
  // loadModel(docs: Container[]): void {
  //   throw new Error("Method not implemented.")
  // }
  // dump(): Container[] {
  //   throw new Error("Method not implemented.")
  // }

  build (f: (builder: this) => Promise<Obj[]>): Promise<Obj[]> {
    return f(this)
  }
}

export default CoreBuilder
