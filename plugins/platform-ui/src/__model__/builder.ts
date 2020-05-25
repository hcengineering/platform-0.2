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

import { Session, Emb, Doc, Obj, Ref, EClass, Class, AllAttributes } from '@anticrm/platform-core'

export class Builder {

  private session: Session

  constructor(session: Session) {
    this.session = session
  }

  createClass<T extends E, E extends Obj> (values: Omit<EClass<T, E>, keyof Obj>): EClass<T, E> {
    return this.session.createClass(values)
  }

  createStruct<T extends E, E extends Obj> (_id: Ref<Class<T>>, _extends: Ref<Class<E>>, _attributes: AllAttributes<T, E>): EClass<T, E> {
    return this.session.createClass<T, E>({ _id, _extends, _attributes })
  }

}