//
// Copyright © 2020 Andrey Platov <andrey.v.platov@gmail.com>
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
import { IntlString } from '@anticrm/platform-core-i18n'

import { Builder as CoreBuilder } from '@anticrm/platform-core/src/__resources__/builder'
import ui from '.'

export class Builder extends CoreBuilder {

  protected session: Session

  constructor(session: Session) {
    super(session)
    this.session = session
  }

  i18n(): Type<IntlString> {
    const meta = this.session.getStruct(ui.class.IntlString)
    return meta.newInstance({})
  }

}
