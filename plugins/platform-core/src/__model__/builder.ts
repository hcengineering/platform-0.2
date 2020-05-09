//
// Copyright © 2020 Andrey Platov <andrey.v.platov@gmail.com>
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
import { Session, Doc, Ref, Emb, Class, DiffDescriptors, Type } from '..'
import core from './id'

export class Builder implements Session {

  protected session: Session

  constructor(session: Session) {
    this.session = session
  }
  getInstance<T extends Doc>(ref: Ref<T>, as: Ref<Class<T>>): T {
    throw new Error("Method not implemented.")
  }
  loadModel(docs: import("..").Container[]): void {
    throw new Error("Method not implemented.")
  }
  dump(): import("..").Container[] {
    throw new Error("Method not implemented.")
  }

  getStruct<T extends Emb>(_struct: Ref<Class<T>>): Class<T> {
    return this.session.getStruct(_struct)
  }

  getClass<T extends Doc>(_class: Ref<Class<T>>): Class<T> {
    return this.session.getClass(_class)
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

  meta<T>(): Type<Metadata<T>> {
    const meta = this.session.getStruct(core.class.Metadata)
    return meta.newInstance({})
  }

}