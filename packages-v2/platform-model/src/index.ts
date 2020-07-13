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

import core, { ArrayOf, BagOf, InstanceOf, RefTo, Type } from '@anticrm/platform-core'
import { extendIds } from './utils'
import { Class, Doc, Emb, Obj, Ref } from '@anticrm/platform'

export { extendIds }
export { default as Builder } from './builder'

export default extendIds(core, {
  class: {
    Obj: '' as Ref<Class<Obj>>,
    Doc: '' as Ref<Class<Doc>>,
    Class: '' as Ref<Class<Class<Obj>>>,

    Type: '' as Ref<Class<Type>>,

    RefTo: '' as Ref<Class<RefTo<Doc>>>,
    InstanceOf: '' as Ref<Class<InstanceOf<Emb>>>,
    BagOf: '' as Ref<Class<BagOf<Type>>>,
    ArrayOf: '' as Ref<Class<ArrayOf<Type>>>,

    String: '' as Ref<Class<Type>>
  }
})
