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

import { _class, ref, intl, bag, instance, extension, Attibutes } from './dsl'
import { Obj, Ref, Class, Doc } from '../types'
import core from './id'

const attributes: Attibutes<Obj> = {
  _class: ref(core.class.Class),
  toIntlString: extension(core.method.Obj_toIntlString)
}

const objectClass: Class<Obj> = {
  _class: core.class.Class,
  _id: core.class.Object,
  // label: '' as IntlString,
  attributes
}

export default {
  strings: {
    ru
  },
  model: [
    objectClass,

    _class(core.class.Doc, core.class.Object, {
      attributes: {
        _id: ref(core.class.Doc)
      }
    }),

    _class(core.class.RefTo, core.class.Object, {
      attributes: {
        _default: ref(core.class.Doc),
        to: ref(core.class.Class)
      }
    }),

    _class(core.class.Class, core.class.Doc, {
      attributes: {
        // label: intl(),
        extends: ref(core.class.Class),
        attributes: bag(instance(core.class.Type)),
      },
      override: {
        toIntlString: extension(core.method.Class_toIntlString)
      }
    }),
  ]
}
