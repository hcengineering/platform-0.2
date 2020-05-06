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

import ru from './strings/ru'

import { Obj, Ref, Class, Doc, BagOf, InstanceOf, RefTo, TypeMetadata } from '..'
import { createDocs } from './utils'
import core from './id'

// const core = identify(pluginId, {
//   native: {
//     Object: '' as Metadata<Obj>,
//     Metadata: '' as Metadata<TypeMetadata<any>>,
//     RefTo: '' as Metadata<RefTo<Doc>>,
//     BagOf: '' as Metadata<BagOf<PropertyType>>,
//     InstanceOf: '' as Metadata<InstanceOf<Embedded>>,
//   },
//   class: {
//     Object: '' as Ref<Class<Obj>>,
//     Class: '' as Ref<Class<Class<Obj>>>,
//     RefTo: '' as Ref<Class<RefTo<Doc>>>,
//     Doc: '' as Ref<Class<Doc>>,
//     Type: '' as Ref<Class<Type<PropertyType>>>,
//     BagOf: '' as Ref<Class<BagOf<PropertyType>>>,
//     InstanceOf: '' as Ref<Class<InstanceOf<Embedded>>>,
//     Metadata: '' as Ref<Class<Type<Metadata<any>>>>,
//   },
// })

const model = [
  new Class(core.class.Class, core.class.Object, {
    _class: new RefTo(core.class.Class)
  }, undefined as unknown as Ref<Class<Obj>>, core.native.Object),
  Class.createClass(core.class.Doc, core.class.Object, {
    _id: new RefTo(core.class.Doc)
  }),
  Class.createClass(core.class.Type, core.class.Object, {}),
  Class.createClass(core.class.Metadata, core.class.Type, {
  }, core.native.Metadata),
  Class.createClass(core.class.RefTo, core.class.Type, {
    to: new RefTo(core.class.Class as Ref<Class<Class<Doc>>>),
  }, core.native.RefTo),
  Class.createClass(core.class.BagOf, core.class.Type, {
    of: new InstanceOf(core.class.Type),
  }, core.native.BagOf),
  Class.createClass(core.class.InstanceOf, core.class.Type, {
    of: new RefTo(core.class.Class),
  }, core.native.InstanceOf),
  Class.createClass(core.class.Class, core.class.Doc, {
    attributes: new BagOf(new InstanceOf(core.class.Type)),
    extends: new RefTo(core.class.Class),
    native: new TypeMetadata()
  })
]

export default {
  strings: {
    ru
  },
  events: createDocs(model)
}
