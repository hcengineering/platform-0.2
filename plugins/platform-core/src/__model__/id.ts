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

import core, { pluginId, Ref, Class, Doc, Obj, Mixin, Type, PropertyType, RefTo, BagOf, InstanceOf, Embedded } from '../types'
import platform, { IntlString, Extension } from '../platform'
import { mergeIds } from './utils'

export default mergeIds(core, platform.identify(pluginId, {
  class: {
    Doc: '' as Ref<Class<Doc>>,
    Mixin: '' as Ref<Class<Mixin<Doc>>>,
    Type: '' as Ref<Class<Type<PropertyType>>>,
    RefTo: '' as Ref<Class<RefTo<Doc>>>,
    BagOf: '' as Ref<Class<BagOf<PropertyType>>>,
    InstanceOf: '' as Ref<Class<InstanceOf<Embedded>>>,
    IntlString: '' as Ref<Class<Type<IntlString>>>,
    Extension: '' as Ref<Class<Type<Extension<any>>>>,
  }
}))
