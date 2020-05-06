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

import { _class, ref, bag, instance, create, metadata } from './dsl'
import { Obj, Ref, Class, Doc, Type, PropertyType, Descriptors, Bag, AnyType, H } from '@anticrm/platform-service-data'
import core from './id'

const x = {} as Descriptors<Obj>


const attributes: Descriptors<Obj> = {
  _class: ref(core.class.Class),
}

const objectClass: H<Class<Obj>> = {
  _class: core.class.Class,
  _id: core.class.Object,
  native: core.native.Object,
  attributes: attributes as unknown as { [key: string]: Type<PropertyType> }
}

export default {
  strings: {
    ru
  },
  events: [
    create(objectClass),

    create(_class(core.class.Doc, core.class.Object, {
      attributes: {
        _id: ref(core.class.Doc)
      }
    })),

    create(_class(core.class.RefTo, core.class.Object, {
      native: core.native.RefTo,
      attributes: {
        _default: ref(core.class.Doc),
        to: ref(core.class.Class),
      }
    })),

    create(_class(core.class.Class, core.class.Doc, {
      attributes: {
        native: metadata(undefined),
        extends: ref(core.class.Class),
        attributes: bag(instance(core.class.Type)),
      },
    })),

    create(_class(core.class.BagOf, core.class.Object, {
      attributes: {
        _default: bag(metadata(undefined)), // ?????? TODO undefined type
        of: instance(core.class.Type),
      }
    })),

    create(_class(core.class.InstanceOf, core.class.Object, {
      attributes: {
        _default: {} as Type<Obj>,
        of: ref(core.class.Class),
      }
    })),

    create(_class(core.class.Metadata, core.class.Object, {
      native: core.native.Metadata,
      attributes: {
        _default: metadata(undefined),
      }
    })),
  ]
}
