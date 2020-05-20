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
  Session, Obj, Doc, Class, BagOf, InstanceOf, ResourceType,
  Property, Type, Emb, ResourceProperty, Ref, RefTo, ArrayOf
} from '..'

export default (S: Session): Doc[] => {
  return [
    S.createClass<Obj, Obj>({
      _id: core.class.Obj,
      _attributes: {}
    }),

    S.createClass<Emb, Emb>({
      _id: core.class.Emb,
      _attributes: {},
      _extends: core.class.Obj
    }),

    S.createClass<Doc, Obj>({
      _id: core.class.Doc,
      _attributes: {
        _id: S.newInstance(core.class.RefTo, {
          to: core.class.Doc
        }),
        _mixins: S.newInstance(core.class.ArrayOf, {
          of: S.newInstance(core.class.RefTo, { to: core.class.Doc })
        })
      },
      _extends: core.class.Obj
    }),

    S.createClass<Class<Obj>, Doc>({
      _id: core.class.Class,
      _attributes: {
        _attributes: S.newInstance(core.class.BagOf, {
          of: S.newInstance(core.class.InstanceOf, { of: core.class.Type })
        }),
        _extends: S.newInstance(core.class.RefTo as Ref<Class<RefTo<Class<Obj>>>>, {
          to: core.class.Class
        }),
        _native: S.newInstance(core.class.ResourceType, {})
      },
      _extends: core.class.Doc
    }),

    S.createClass<Type<any>, Emb>({
      _id: core.class.Type,
      _attributes: {
        _default: S.newInstance(core.class.Type, {}),
        exert: S.newInstance(core.class.ResourceType, {
          _default: core.method.Type_exert
        })
      },
      _extends: core.class.Emb
    }),

    S.createClass<BagOf<any>, Type<any>>({
      _id: core.class.BagOf,
      _attributes: {
        of: S.newInstance(core.class.InstanceOf as Ref<Class<InstanceOf<Type<any>>>>, {
          of: core.class.Type
        }),
        exert: S.newInstance(core.class.ResourceType, {
          _default: core.method.BagOf_exert
        })
      },
      _extends: core.class.Type
    }),

    S.createClass<ArrayOf<any>, Type<any>>({
      _id: core.class.ArrayOf,
      _attributes: {
        of: S.newInstance(core.class.InstanceOf as Ref<Class<InstanceOf<Type<any>>>>, {
          of: core.class.Type
        })
      },
      _extends: core.class.Type
    }),

    S.createClass<InstanceOf<any>, Type<any>>({
      _id: core.class.InstanceOf,
      _attributes: {
        of: S.newInstance(core.class.RefTo as Ref<Class<RefTo<Class<Obj>>>>, {
          to: core.class.Class
        }),
        exert: S.newInstance(core.class.ResourceType, {
          _default: core.method.InstanceOf_exert
        })
      },
      _extends: core.class.Type
    }),

    S.createClass<RefTo<any>, Type<any>>({
      _id: core.class.RefTo,
      _attributes: {
        to: S.newInstance(core.class.RefTo as Ref<Class<RefTo<Class<Obj>>>>, {
          to: core.class.Class
        })
      },
      _extends: core.class.Type
    }),

    S.createClass<ResourceType<any>, Type<any>>({
      _id: core.class.ResourceType,
      _attributes: {},
      _extends: core.class.Type,
      _native: core.native.ResourceType
    })

  ]
}
