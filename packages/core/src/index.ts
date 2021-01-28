//
// Copyright © 2020, 2021 Anticrm Platform Contributors.
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

// Following imports does not used directly but required for `api-extractor` to work. Do not remove.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Obj, Emb, Doc, Classifier, Attribute, Mixin, Type, ArrayOf, RefTo, InstanceOf, BagOf, Indices } from './classes'

import model from '@anticrm/model'
import { Class, Ref } from './classes'
import { AnyPlugin, identify } from '@anticrm/platform'
import { Backlinks } from './text'
import { Title } from './title'
import { CreateTx, DeleteTx, PushTx, UpdateTx, Tx } from './tx'
import { Application, VDoc } from './vdoc'
import { Space, SpaceUser } from './space'
import { mergeWith } from 'lodash'

type Namespace = Record<string, Record<string, any>>

function mergeIds<D extends Namespace, N extends Namespace> (pluginId: AnyPlugin, a: D, b: N): D & N {
  return mergeWith({}, a, identify(pluginId, b), (value) => {
    if (typeof value === 'string') {
      throw new Error('attempting to overwrite ' + value)
    }
  })
}

const core = mergeIds('core' as AnyPlugin, model, {
  class: {
    Tx: '' as Ref<Class<Tx>>,
    CreateTx: '' as Ref<Class<CreateTx>>,
    PushTx: '' as Ref<Class<PushTx>>,
    UpdateTx: '' as Ref<Class<UpdateTx>>,
    DeleteTx: '' as Ref<Class<DeleteTx>>,

    Title: '' as Ref<Class<Title>>,

    VDoc: '' as Ref<Class<VDoc>>,

    Space: '' as Ref<Class<Space>>,
    SpaceUser: '' as Ref<Class<SpaceUser>>,

    Backlinks: '' as Ref<Class<Backlinks>>,

    Application: '' as Ref<Class<Application>>
  }
})
export default core

export * from './rpc'
export * from './classes'
export * from './model'
export * from './text'
export * from './textmodel'
export * from './tx'
export * from './title'
export * from './space'
export * from './vdoc'
export * from './objectid'
export * from './utils'
