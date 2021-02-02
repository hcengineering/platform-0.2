//
// Copyright © 2020, 2021 Anticrm Platform Contributors.
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

import { Class$, Prop } from '../dsl'
import core from '../index'
import { Reference, REFERENCE_DOMAIN } from '@anticrm/domains'
import { TDoc } from './core'
import { Class, Doc, Ref } from '@anticrm/core'

@Class$(core.class.Reference, core.class.Doc, REFERENCE_DOMAIN)
export class TReference extends TDoc implements Reference {
  @Prop() _sourceId?: Ref<Doc>
  @Prop() _sourceClass!: Ref<Class<Doc>>
  @Prop() _sourceProps?: Record<string, unknown>

  @Prop() _targetId?: Ref<Doc>
  @Prop() _targetClass!: Ref<Class<Doc>>
  @Prop() _targetProps?: Record<string, unknown>
}
