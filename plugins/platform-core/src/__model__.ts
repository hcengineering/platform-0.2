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

import {
  Attribute, Class, Classifier, Doc, Emb, Mixin, Obj, Ref, Tx, Type, VDoc,
  ArrayOf, BagOf, InstanceOf, RefTo, Indices, CORE_CLASS_TEXT, Space,
  DateProperty, StringProperty, Backlinks, Backlink, BACKLINKS_DOMAIN, MODEL_DOMAIN, TX_DOMAIN, TITLE_DOMAIN
} from '@anticrm/core'

import { extendIds, ModelClass, Prop, Builder } from '@anticrm/model'
import _core, { Application } from '@anticrm/platform-core'

const core = extendIds(_core, {
  class: {
    Obj: '' as Ref<Class<Obj>>,
    Emb: '' as Ref<Class<Emb>>,
    Doc: '' as Ref<Class<Doc>>,

    Classifier: '' as Ref<Class<Classifier<Obj>>>,
    Mixin: '' as Ref<Class<Mixin<Doc>>>,

    Attribute: '' as Ref<Class<Attribute>>,
    Type: '' as Ref<Class<Type>>,
    Text: CORE_CLASS_TEXT,

    VDoc: '' as Ref<Class<VDoc>>,
    Tx: '' as Ref<Class<Tx>>,

    RefTo: '' as Ref<Class<RefTo<Doc>>>,
    InstanceOf: '' as Ref<Class<InstanceOf<Emb>>>,
    BagOf: '' as Ref<Class<BagOf<Type>>>,
    ArrayOf: '' as Ref<Class<ArrayOf<Type>>>,

    String: '' as Ref<Class<Type>>,
    Application: '' as Ref<Class<Application>>
  },
  mixin: {
    Indices: '' as Ref<Mixin<Indices>>,
  }
})

export default core

@ModelClass(core.class.Obj, core.class.Obj)
class TObj implements Obj {
  _class!: Ref<Class<Obj>>
}

@ModelClass(core.class.Emb, core.class.Obj)
class TEmb extends TObj implements Emb {
  __embedded!: true
}

@ModelClass(core.class.Doc, core.class.Obj)
class TDoc extends TObj implements Doc {
  _class!: Ref<Class<Doc>>
  @Prop() _id!: Ref<Doc>
  @Prop() _mixins?: Ref<Mixin<Doc>>[]
}

@ModelClass(core.class.Application, core.class.Doc, MODEL_DOMAIN)
export class TApplication extends TDoc implements Application {
}

@ModelClass(core.class.Space, core.class.Doc, MODEL_DOMAIN)
export class TSpace extends TDoc implements Space {
  @Prop() label!: string
}

@ModelClass(core.class.VDoc, core.class.Doc)
export class TVDoc extends TDoc implements VDoc {
  @Prop() _space!: Ref<Space>
  @Prop() _createdOn!: DateProperty
  @Prop() _createdBy!: StringProperty
  @Prop() _modifiedOn?: DateProperty
  @Prop() _modifiedBy?: StringProperty
}

@ModelClass(core.class.Backlinks, core.class.Doc, BACKLINKS_DOMAIN)
class TBacklinks extends TDoc implements Backlinks {
  @Prop() _objectId!: Ref<VDoc>
  @Prop() _objectClass!: Ref<Class<VDoc>>
  @Prop() backlinks!: Backlink[]
}

export function model (S: Builder) {

  S.add(TObj, TEmb, TDoc, TVDoc, TBacklinks, TApplication, TSpace)

  S.createClass(core.class.Attribute, core.class.Emb, {
    type: S.attr(core.class.Type, {})
  })

  S.createClass(core.class.Type, core.class.Emb, {
    _default: S.attr(core.class.Type, {})
  })

  S.createClass(core.class.RefTo, core.class.Type, {
    to: S.attr(core.class.Type, {})
  })

  S.createClass(core.class.Classifier, core.class.Doc, {
    _kind: S.attr(core.class.Type, {}),
    _extends: S.attr(core.class.RefTo, {
      to: core.class.Class
    }),
    _attributes: S.attr(core.class.BagOf, {
      of: S.newInstance(core.class.InstanceOf, { of: core.class.Type })
    })
  })

  S.createClass(core.class.Class, core.class.Classifier, {
    _native: S.attr(core.class.Type, {}),
    _domain: S.attr(core.class.Type, {})
  }, MODEL_DOMAIN)

  S.createClass(core.class.Mixin, core.class.Class, {
  }, MODEL_DOMAIN)

  S.createClass(core.class.Title, core.class.Doc, {
    _objectClass: S.attr(core.class.RefTo, { to: core.class.Class }),
    _objectId: S.attr(core.class.Type, {}),
    title: S.attr(core.class.Type, {}),
  }, TITLE_DOMAIN)

  S.createClass(core.class.Tx, core.class.Doc, {
    _objectClass: S.attr(core.class.RefTo, { to: core.class.Class }),
    _objectId: S.attr(core.class.Type, {}),
    _date: S.attr(core.class.Type, {}),
    _user: S.attr(core.class.Type, {}),
  }, TX_DOMAIN)

  S.createClass(core.class.CreateTx, core.class.Tx, {
    _space: S.attr(core.class.Type, {}),
    _attributes: S.attr(core.class.BagOf, {
      of: S.newInstance(core.class.InstanceOf, { of: core.class.Type })
    })
  }, TX_DOMAIN)

  S.createClass(core.class.PushTx, core.class.Tx, {
    _attribute: S.attr(core.class.Type, {}),
    _attributes: S.attr(core.class.BagOf, {
      of: S.newInstance(core.class.InstanceOf, { of: core.class.Type })
    })
  }, TX_DOMAIN)

  S.createClass(core.class.UpdateTx, core.class.Tx, {
    _attributes: S.attr(core.class.BagOf, {
      of: S.newInstance(core.class.InstanceOf, { of: core.class.Type })
    })
  }, TX_DOMAIN)

  S.createClass(core.class.DeleteTx, core.class.Tx, {
  }, TX_DOMAIN)

  S.createMixin(core.mixin.Indices, core.class.Class, {
    primary: S.attr(core.class.Type, {})
  })
}
