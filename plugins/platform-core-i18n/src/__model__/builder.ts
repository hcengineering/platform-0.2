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

import { Session, Type } from '@anticrm/platform-core'
import { IntlString } from '..'

import CoreBuilder from '@anticrm/platform-core/src/__model__/builder'
import i18n from '.'

export default class extends CoreBuilder {
  protected session: Session

  constructor(session: Session) {
    super(session)
    this.session = session
  }

  async i18n (): Promise<Type<IntlString>> {
    const meta = await this.session.getClass(i18n.class.IntlString)
    return meta.newInstance({})
  }
}
