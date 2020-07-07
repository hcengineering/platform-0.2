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
import { Obj, Doc, Class, InstanceOf, Type, Emb, Ref, RefTo, CoreDomain } from '..'
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
    _native: S.newInstance(core.class.StaticResource, {}),
    _domain: S.newInstance(core.class.Type, {})
  }, CoreDomain.Model)

  S.createClass(core.class.Type, core.class.Emb, {
    _default: S.newInstance(core.class.Type, {}),
    exert: S.newInstance(core.class.StaticResource, {
      _default: S.resolve(core.method.Type_exert)
    }),
    hibernate: S.newInstance(core.class.StaticResource, {
      _default: S.resolve(core.method.Type_hibernate)
    })
  })

  S.createClass(core.class.BagOf, core.class.Type, {
    of: S.newInstance(core.class.InstanceOf as Ref<Class<InstanceOf<Type<any>>>>, {
      of: core.class.Type
    }),
    exert: S.newInstance(core.class.StaticResource, {
      _default: S.resolve(core.method.BagOf_exert)
    })
  })

  S.createClass(core.class.ArrayOf, core.class.Type, {
    of: S.newInstance(core.class.InstanceOf as Ref<Class<InstanceOf<Type<any>>>>, {
      of: core.class.Type
    })
  })

  S.createClass(core.class.InstanceOf, core.class.Type, {
    of: S.newInstance(core.class.RefTo as Ref<Class<RefTo<Class<Emb>>>>, {
      to: core.class.Class as Ref<Class<Class<Emb>>>
    }),
    exert: S.newInstance(core.class.StaticResource, {
      _default: S.resolve(core.method.InstanceOf_exert)
    })
  })

  S.createClass(core.class.RefTo, core.class.Type, {
    to: S.newInstance(core.class.RefTo as Ref<Class<RefTo<Class<Doc>>>>, {
      to: core.class.Class as Ref<Class<Class<Doc>>>
    })
  })

  S.createClass(core.class.Metadata, core.class.Type, {
    exert: S.newInstance(core.class.StaticResource, {
      _default: S.resolve(core.method.Metadata_exert)
    })
  })

  S.createClass(core.class.Resource, core.class.Type, {
    exert: S.newInstance(core.class.StaticResource, {
      _default: S.resolve(core.method.Resource_exert)
    })
  })

  S.createClass(core.class.StaticResource, core.class.Type, {}, undefined, core.native.StaticResource)

  S.createClass(core.class.Method, core.class.StaticResource, {})

  S.createClass(core.class.Date, core.class.Type, {
    exert: S.newInstance(core.class.StaticResource, {
      _default: S.resolve(core.method.Date_exert)
    }),
    hibernate: S.newInstance(core.class.StaticResource, {
      _default: S.resolve(core.method.Date_hibernate)
    })
  })

  S.createClass(core.class.VDoc, core.class.Doc, {
    _createdOn: S.newInstance(core.class.Type, {}),
    _createdBy: S.newInstance(core.class.Type, {}),
    _modifiedOn: S.newInstance(core.class.Type, {}),
    _modifiedBy: S.newInstance(core.class.Type, {})
  })

  S.createClass(core.class.Tx, core.class.Doc, {
    _date: S.newInstance(core.class.Type, {}),
    _user: S.newInstance(core.class.Type, {}),
    _objectId: S.newInstance(core.class.RefTo, {
      to: core.class.VDoc
    })
  })

  S.createClass(core.class.CreateTx, core.class.Tx, {
    _objectClass: S.newInstance(core.class.RefTo, {
      to: core.class.Class
    }),
    _attributes: S.newInstance(core.class.BagOf, {
      of: S.newInstance(core.class.InstanceOf, { of: core.class.Type })
    })
  })

  S.createClass(core.class.Adapter, core.class.Doc, {
    from: S.newInstance(core.class.Type, {}),
    to: S.newInstance(core.class.Type, {}),
    adapt: S.newInstance(core.class.Resource, {})
  }, CoreDomain.Model)
}
