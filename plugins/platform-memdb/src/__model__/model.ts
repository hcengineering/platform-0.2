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
import { CoreService, Obj, Doc, Class, Property, Type, Emb, ResourceProperty } from '..'


function build (S: CoreService): Doc[] {
  return [
    S.newClass<Obj, Obj>({
      _id: core.class.Obj,
      _attributes: {}
    }),

    S.newClass<Doc, Obj>({
      _id: core.class.Doc,
      _attributes: {
        _id: S.newInstance(core.class.RefTo, {
          to: core.class.Doc,
        }),
        _mixins: S.newInstance(core.class.ArrayOf, {
          of: S.newInstance(core.class.RefTo, { to: core.class.Doc })
        })
      }
    }),

    S.newClass<Class<Obj>, Doc>({
      _id: core.class.Class,
      _attributes: {
        _attributes: S.newInstance(core.class.BagOf, {
          of: S.newInstance(core.class.InstanceOf, { of: core.class.Type })
        })
      }
    }),

    S.newClass<Type<any>, Emb>({
      _id: core.class.Type,
      _attributes: {
        default: S.newInstance(core.class.Type, {}),
        exert: S.newInstance(core.class.ResourceType, {
          default: 'func: type.exert' as ResourceProperty<(value: Property<any>) => any>
        })
      }
    })
  ]
}
