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
  Class,
  Doc,
  Emb,
  MemDb,
  Metadata,
  Method,
  Plugin,
  plugin,
  Property,
  PropertyType,
  Ref,
  Service,
  StringProperty
} from '@anticrm/platform'

// T Y P E S

export interface Type extends Emb {
  _default?: PropertyType
  exert: Method<() => any>
  hibernate: Method<(value: any) => PropertyType>
}

export interface RefTo<T extends Doc> extends Type {
  to: Ref<Class<T>>
}

export interface InstanceOf<T extends Emb> extends Type {
  of: Ref<Class<T>>
}

export interface BagOf<A> extends Type {
  of: Type
}

export interface ArrayOf<A> extends Type {
  of: Type
}

// export interface StaticResource<T> extends Type<T> { }
// export interface Method<T> extends StaticResource<T> { }

// V E R S I O N I N G

export type DateProperty = Property<number, Date>

export interface VDoc extends Doc {
  _createdOn: DateProperty
  _createdBy: StringProperty
  _modifiedOn?: DateProperty
  _modifiedBy?: StringProperty
}

export interface Tx extends Doc {
  _date: DateProperty
  _user: StringProperty
  _objectId: Ref<VDoc>
}

export interface CreateTx extends Tx {
  _objectClass: Ref<Class<VDoc>>
  _attributes: { [key: string]: PropertyType }
}

// P L U G I N

export interface CoreService extends Service {
  getModel(): MemDb
}

export default plugin('core' as Plugin<CoreService>, {}, {
  metadata: {
    Model: '' as Metadata<{ [key: string]: Doc[] }>
  }
})
