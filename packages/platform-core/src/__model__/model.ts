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

import core from '.'
import {
  Obj, Doc, Class, InstanceOf, ResourceType, Type, Emb, Ref, RefTo
} from '..'
import Builder from './builder'
export { Builder }

export default (S: Builder) => {
  S.createDocument(core.class.Class, {
    _attributes: {}
  }, core.class.Obj)

  S.createClass(core.class.Emb, core.class.Obj as Ref<Class<Emb>>, {})

  S.createClass(core.class.Doc, core.class.Obj, {
    _id: S.newInstance(core.class.RefTo, {
      to: core.class.Doc
    }),
    _mixins: S.newInstance(core.class.ArrayOf, {
      of: S.newInstance(core.class.RefTo, { to: core.class.Doc })
    })
  })

  S.createClass(core.class.Class, core.class.Doc, {
    _attributes: S.newInstance(core.class.BagOf, {
      of: S.newInstance(core.class.InstanceOf, { of: core.class.Type })
    }),
    _extends: S.newInstance(core.class.RefTo as Ref<Class<RefTo<Class<Obj>>>>, {
      to: core.class.Class
    }),
    _native: S.newInstance(core.class.ResourceType, {})
  })

  S.createClass(core.class.Type, core.class.Emb, {
    _default: S.newInstance(core.class.Type, {}),
    exert: S.newInstance(core.class.ResourceType, {
      _default: core.method.Type_exert
    })
  })

  S.createClass(core.class.BagOf, core.class.Type, {
    of: S.newInstance(core.class.InstanceOf as Ref<Class<InstanceOf<Type<any>>>>, {
      of: core.class.Type
    }),
    exert: S.newInstance(core.class.ResourceType, {
      _default: core.method.BagOf_exert
    })
  })

  S.createClass(core.class.ArrayOf, core.class.Type, {
    of: S.newInstance(core.class.InstanceOf as Ref<Class<InstanceOf<Type<any>>>>, {
      of: core.class.Type
    })
  })

  S.createClass(core.class.InstanceOf, core.class.Type, {
    of: S.newInstance(core.class.RefTo as Ref<Class<RefTo<Class<Emb>>>>, {
      to: core.class.Class
    }),
    exert: S.newInstance(core.class.ResourceType, {
      _default: core.method.InstanceOf_exert
    })
  })

  S.createClass(core.class.RefTo, core.class.Type, {
    to: S.newInstance(core.class.RefTo as Ref<Class<RefTo<Class<Doc>>>>, {
      to: core.class.Class as Ref<Class<Class<Doc>>>
    })
  })

  S.createClass(core.class.Metadata, core.class.Type, {
    exert: S.newInstance(core.class.ResourceType, {
      _default: core.method.Metadata_exert
    })
  })

  S.createClass<ResourceType<any>, Type<any>>(core.class.ResourceType, core.class.Type, {})
  S.patch(core.class.ResourceType, (clazz) => { clazz._native = core.native.ResourceType })
}
