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

import core from '@anticrm/platform-core/src/__model__'
import Builder from '@anticrm/platform-core/src/__model__/builder'

import business from '.'

export default (S: Builder) => {
  S.createClass(business.class.Account, core.class.Doc, {
    id: S.newInstance(core.class.Type, {}),
    user: S.ref(business.class.User)
  })

  S.createClass(business.class.BusinessObject, core.class.Doc, {
    createdOn: S.newInstance(core.class.Type, {}),
    createdBy: S.ref(business.class.Account),
    onBehalfOf: S.ref(business.class.User),

    getText: S.newInstance(core.class.Method, {
      _default: S.resolve(business.method.BusinessObject_getText)
    }),
    getImage: S.newInstance(core.class.Method, {
      _default: S.resolve(business.method.BusinessObject_getImage)
    }),
  })
}
