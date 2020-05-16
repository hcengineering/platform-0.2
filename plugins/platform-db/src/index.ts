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

import { plugin, PluginId } from '@anticrm/platform'

export type ContainerId = string
export type ClassId = ContainerId

export interface Container {
  _id: ContainerId
  _class: ClassId
  _mixins?: ClassId[]
}

interface Attribute { }

export interface ContainerClass extends Container {
  _attributes: { [key: string]: Attribute }
  _extends?: ClassId
  _native?: string
}

export interface Db {
  getClass(_class: ClassId): ContainerClass
  get(_id: ContainerId): Container
  createContainer(_id: ContainerId, _class: ClassId): Container
  index(container: Container): void

  load(docs: Container[]): void
  dump(): Container[]
}

export default plugin('db' as PluginId<Db>, {}, {})
