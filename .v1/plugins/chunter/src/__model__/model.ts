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

import { DocMessage } from '..'
import Builder from '@anticrm/platform-core/src/__model__/builder'

import core from '@anticrm/platform-core/src/__model__'
import business from '@anticrm/platform-business/src/__model__'
import chunter from '.'

const ChunterDomain = 'chunter'

export default async (S: Builder) => {

  S.createClass(chunter.class.Channel, business.class.BusinessObject, {}, ChunterDomain)

  S.createClass(chunter.class.DocMessage, business.class.BusinessObject, {
    channel: S.ref(chunter.class.Channel),
    participants: S.arrayOf(S.ref(business.class.User)),
    replies: S.arrayOf(S.instanceOf(chunter.class.EmbMessage)),

    text: S.newInstance(core.class.Type, {})
  }, ChunterDomain)

  S.createClass(chunter.class.EmbMessage, core.class.Emb, {
    createdOn: S.newInstance(core.class.Type, {}),
    createdBy: S.ref(business.class.Account),
    onBehalfOf: S.ref(business.class.User),

    text: S.newInstance(core.class.Type, {})
  })

}