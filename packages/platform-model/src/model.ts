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
  CoreDomain, Obj, Emb, Doc, Ref, Class, Mixin, VDoc,
  StringProperty, DateProperty, Space, BACKLINKS_CLASS, Backlinks, Backlink, BACKLINKS_DOMAIN
} from '@anticrm/platform'

import Builder from './builder'
import core from '.'
import { ModelClass, Prop } from './dsl'

export { Builder }

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

@ModelClass(core.class.VDoc, core.class.Doc)
export class TVDoc extends TDoc implements VDoc {
  @Prop() _space!: Ref<Space>
  @Prop() _createdOn!: DateProperty
  @Prop() _createdBy!: StringProperty
  @Prop() _modifiedOn?: DateProperty
  @Prop() _modifiedBy?: StringProperty
}

@ModelClass(BACKLINKS_CLASS, core.class.Doc, BACKLINKS_DOMAIN)
class TBacklinks extends TDoc implements Backlinks {
  @Prop() _objectId!: Ref<VDoc>
  @Prop() _objectClass!: Ref<Class<VDoc>>
  @Prop() backlinks!: Backlink[]
}

export default (S: Builder) => {

  S.add(TObj, TEmb, TDoc, TVDoc, TBacklinks)

  S.createClass(core.class.Attribute, core.class.Emb, {
    type: S.attr(core.class.Type, {})
  })

  S.createClass(core.class.Type, core.class.Emb, {
    _default: S.attr(core.class.Type, {})
  })

  S.createClass(core.class.ESFunc, core.class.Type, {
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
  }, CoreDomain.Model)

  S.createClass(core.class.Mixin, core.class.Class, {
  }, CoreDomain.Model)

  S.createClass(core.class.Space, core.class.Doc, {
  }, CoreDomain.Model)

  S.createClass(core.class.Title, core.class.Doc, {
    _objectClass: S.attr(core.class.RefTo, { to: core.class.Class }),
    _objectId: S.attr(core.class.Type, {}),
    title: S.attr(core.class.Type, {}),
  }, CoreDomain.Title)

  S.createClass(core.class.Tx, core.class.Doc, {
    _objectClass: S.attr(core.class.RefTo, { to: core.class.Class }),
    _objectId: S.attr(core.class.Type, {}),
    _date: S.attr(core.class.Type, {}),
    _user: S.attr(core.class.Type, {}),
  }, CoreDomain.Tx)

  S.createClass(core.class.CreateTx, core.class.Tx, {
    _space: S.attr(core.class.Type, {}),
    _attributes: S.attr(core.class.BagOf, {
      of: S.newInstance(core.class.InstanceOf, { of: core.class.Type })
    })
  }, CoreDomain.Tx)

  S.createClass(core.class.PushTx, core.class.Tx, {
    _attribute: S.attr(core.class.Type, {}),
    _attributes: S.attr(core.class.BagOf, {
      of: S.newInstance(core.class.InstanceOf, { of: core.class.Type })
    })
  }, CoreDomain.Tx)

  S.createClass(core.class.UpdateTx, core.class.Tx, {
    _attributes: S.attr(core.class.BagOf, {
      of: S.newInstance(core.class.InstanceOf, { of: core.class.Type })
    })
  }, CoreDomain.Tx)

  S.createClass(core.class.DeleteTx, core.class.Tx, {
  }, CoreDomain.Tx)

  S.createMixin(core.mixin.Indices, core.class.Class, {
    primary: S.attr(core.class.Type, {})
  })
}
