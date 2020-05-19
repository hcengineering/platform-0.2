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
  CoreService, Obj, Doc, Class, BagOf, InstanceOf, ResourceType,
  Property, Type, Emb, ResourceProperty, Ref, RefTo, ArrayOf
} from '..'

export default (S: CoreService): Doc[] => {
  return [
    S.loadClass<Obj, Obj>({
      _id: core.class.Obj,
      _attributes: {}
    }),

    S.loadClass<Emb, Emb>({
      _id: core.class.Emb,
      _attributes: {},
      _extends: core.class.Obj
    }),

    S.loadClass<Doc, Obj>({
      _id: core.class.Doc,
      _attributes: {
        _id: S.newInstance(core.class.RefTo, {
          to: core.class.Doc,
        }),
        _mixins: S.newInstance(core.class.ArrayOf, {
          of: S.newInstance(core.class.RefTo, { to: core.class.Doc })
        })
      },
      _extends: core.class.Obj
    }),

    S.loadClass<Class<Obj>, Doc>({
      _id: core.class.Class,
      _attributes: {
        _attributes: S.newInstance(core.class.BagOf, {
          of: S.newInstance(core.class.InstanceOf, { of: core.class.Type })
        }),
        _overrides: S.newInstance(core.class.BagOf, {
          of: S.newInstance(core.class.InstanceOf, { of: core.class.Type })
        }),
        _extends: S.newInstance(core.class.RefTo as Ref<Class<RefTo<Class<Obj>>>>, {
          to: core.class.Class
        })
      },
      _extends: core.class.Doc,
    }),

    S.loadClass<Type<any>, Emb>({
      _id: core.class.Type,
      _attributes: {
        _default: S.newInstance(core.class.Type, {}),
        exert: S.newInstance(core.class.ResourceType, {
          _default: 'identity' as ResourceProperty<(value: Property<any>) => any>
        })
      }, _extends: core.class.Emb,
    }),

    S.loadClass<BagOf<any>, Type<any>>({
      _id: core.class.BagOf,
      _attributes: {
        of: S.newInstance(core.class.InstanceOf as Ref<Class<InstanceOf<Type<any>>>>, {
          of: core.class.Type
        })
      },
      _overrides: {
        exert: S.newInstance(core.class.ResourceType, {
          _default: 'bagOf' as ResourceProperty<(value: Property<any>) => any>
        })
      },
      _extends: core.class.Type,
    }),

    S.loadClass<ArrayOf<any>, Type<any>>({
      _id: core.class.ArrayOf,
      _attributes: {
        of: S.newInstance(core.class.InstanceOf as Ref<Class<InstanceOf<Type<any>>>>, {
          of: core.class.Type
        })
      }, _extends: core.class.Type,
    }),

    S.loadClass<InstanceOf<any>, Type<any>>({
      _id: core.class.InstanceOf,
      _attributes: {
        of: S.newInstance(core.class.RefTo as Ref<Class<RefTo<Class<Obj>>>>, {
          to: core.class.Class
        }),
      },
      _overrides: {
        exert: S.newInstance(core.class.ResourceType, {
          _default: 'instanceOf' as ResourceProperty<(value: Property<any>) => any>
        })
      },
      _extends: core.class.Type,
    }),

    S.loadClass<RefTo<any>, Type<any>>({
      _id: core.class.RefTo,
      _attributes: {
        to: S.newInstance(core.class.RefTo as Ref<Class<RefTo<Class<Obj>>>>, {
          to: core.class.Class
        })
      }, _extends: core.class.Type,
    }),

    S.loadClass<ResourceType<any>, Type<any>>({
      _id: core.class.ResourceType,
      _attributes: {},
      _extends: core.class.Type,
    }),

    // S.loadClass<Identity, Type<(value: Property<any>) => any>>({
    //   _id: core.class.Identity,
    //   _attributes: {},
    //   _extends: core.class.Type,
    // })

  ]

}
