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

import { _class, ref, intl, bag, instance, Attibutes, create, syscall } from './dsl'
import { Obj, Ref, Class, Doc, Type, PropertyType } from '@anticrm/platform-service-data'
import core from './id'

const attributes: Attibutes<Obj> = {
  _class: ref(core.class.Class),
  toIntlString: syscall(core.method.Obj_toIntlString),
}

const x = {} as Attibutes<Obj>

const objectClass: Class<Obj> = {
  _class: core.class.Class,
  _id: core.class.Object,
  attributes: attributes as unknown as Record<string, Type<PropertyType>>
}

export default {
  strings: {
    ru
  },
  events: [
    create(objectClass),

    create(_class(core.class.Doc, core.class.Object, {
      attributes: {
        // _id: ref(core.class.Doc)
      }
    })),

    create(_class(core.class.RefTo, core.class.Object, {
      attributes: {
        to: ref(core.class.Class),
        exert: syscall(core.method.SysCall_NotImplemented),
      }
    })),

    create(_class(core.class.Class, core.class.Doc, {
      attributes: {
        extends: ref(core.class.Class),
        attributes: bag(instance(core.class.Type)),
      },
      override: {
        toIntlString: syscall(core.method.Class_toIntlString)
      }
    })),

    create(_class(core.class.BagOf, core.class.Object, {
      attributes: {
        of: instance(core.class.Type),
        exert: syscall(core.method.SysCall_NotImplemented),
      }
    })),

    create(_class(core.class.InstanceOf, core.class.Object, {
      attributes: {
        of: ref(core.class.Class),
        exert: syscall(core.method.SysCall_NotImplemented),
      }
    })),

    create(_class(core.class.SysCall, core.class.Object, {
      attributes: {
        exert: syscall(core.method.SysCall_NotImplemented),
      }
    })),
  ]
}
