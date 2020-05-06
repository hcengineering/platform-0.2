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
  pluginId, Ref, Class, Doc, Mixin, Type,
  PropertyType, RefTo, BagOf, Obj,
  InstanceOf, Embedded, AnyFunc
} from '@anticrm/platform-service-data'

import { mergeIds } from './utils'
import { identify, Metadata } from '@anticrm/platform'

export default mergeIds(core, identify(pluginId, {
  class: {
    Object: '' as Ref<Class<Obj>>,
    Class: '' as Ref<Class<Class<Obj>>>,
    RefTo: '' as Ref<Class<RefTo<Doc>>>,
    Doc: '' as Ref<Class<Doc>>,
    Type: '' as Ref<Class<Type<PropertyType>>>,
    BagOf: '' as Ref<Class<BagOf<PropertyType>>>,
    InstanceOf: '' as Ref<Class<InstanceOf<Embedded>>>,
    Metadata: '' as Ref<Class<Type<Metadata<any>>>>,
  },
  method: {
    // SysCall_NotImplemented: '' as Metadata<(...args: any[]) => any>,
    // Obj_toIntlString: '' as Metadata<(this: Instance<Obj>, plural?: number) => string>,
    // Class_toIntlString: '' as Metadata<(this: Instance<Obj>, plural?: number) => string>
  }
}))
