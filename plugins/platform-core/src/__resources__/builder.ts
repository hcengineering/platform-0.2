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

import { Metadata } from '@anticrm/platform'
import { Session, Doc, Ref, Emb, Class, DiffDescriptors, Type, PropertyType, BagOf, Container, InstanceOf, Obj } from '..'
import core from '.'

export class Builder implements Session {

  protected session: Session

  constructor(session: Session) {
    this.session = session
  }

  meta<T>(): Type<Metadata<T>> {
    const meta = this.session.getClass(core.class.Metadata)
    return meta.newInstance({})
  }

  string(): Type<string> {
    const type = this.session.getClass(core.class.Type) as Class<Type<string>>
    return type.newInstance({})
  }

  bag<T extends PropertyType>(of: Type<T>): BagOf<T> {
    const bagOf = this.session.getClass(core.class.BagOf)
    return bagOf.newInstance({ of }) as BagOf<T>
  }

  struct<T extends Emb>(of: Ref<Class<T>>): InstanceOf<T> {
    const instanceOf = this.session.getClass(core.class.InstanceOf)
    return instanceOf.newInstance({ of }) as InstanceOf<T>
  }

  getClass<T extends Obj>(_class: Ref<Class<T>>): Class<T> {
    return this.session.getClass(_class)
  }

  mixin<T extends E, E extends Doc>(obj: E, _class: Ref<Class<T>>, data: Omit<T, keyof E>): T {
    return this.session.mixin(obj, _class, data)
  }

  createClass<T extends E, E extends Doc>(
    _id: Ref<Class<T>>, _extends: Ref<Class<E>>,
    _attributes: DiffDescriptors<T, E>, _native?: Metadata<T>): Class<T> {
    return this.session.createClass(_id, _extends, _attributes, _native)
  }

  createStruct<T extends E, E extends Emb>(
    _id: Ref<Class<T>>, _extends: Ref<Class<E>>,
    _attributes: DiffDescriptors<T, E>, _native?: Metadata<T>): Class<T> {
    return this.session.createStruct(_id, _extends, _attributes, _native)
  }

  getInstance<T extends Doc>(ref: Ref<T>, as: Ref<Class<T>>): T {
    throw new Error("Method not implemented.")
  }
  loadModel(docs: Container[]): void {
    throw new Error("Method not implemented.")
  }
  dump(): Container[] {
    throw new Error("Method not implemented.")
  }

}