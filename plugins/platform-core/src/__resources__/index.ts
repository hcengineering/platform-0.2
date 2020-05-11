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

import core, {
  Ref, Class, Doc, Type, PropertyType, Obj, RefTo, BagOf, ArrayOf, InstanceOf, Emb
} from '..'

import { extendIds } from './utils'
import { Metadata } from '@anticrm/platform'

export default extendIds(core, {
  class: {
    Emb: '' as Ref<Class<Emb>>,

    Type: '' as Ref<Class<Type<PropertyType>>>,

    String: '' as Ref<Class<Type<string>>>,
    Metadata: '' as Ref<Class<Type<Metadata<any>>>>,

    RefTo: '' as Ref<Class<RefTo<Doc>>>,
    BagOf: '' as Ref<Class<BagOf<PropertyType>>>,
    ArrayOf: '' as Ref<Class<ArrayOf<PropertyType>>>,
    InstanceOf: '' as Ref<Class<InstanceOf<Emb>>>,
  },
})
