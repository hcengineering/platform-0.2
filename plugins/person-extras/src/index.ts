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

import { Class, Emb, Mixin, Ref } from '@anticrm/core'
import core from '@anticrm/platform-core'
import { Plugin, plugin, Service } from '@anticrm/platform'
import { Person } from '@anticrm/contact'

export interface Skill extends Emb {
  level: number
  skill: string
}

export interface Experience extends Emb {
  company?: string
  project?: string
  startedAt: Date
  finishedAt?: Date
  description?: string
  position: string
  skills: Skill[]
}

export interface WithResume extends Person {
  resume: Resume
}

export interface Resume extends Emb {
  experience: Experience[]
  skills: Skill[]
  profInterests: string[]
  hobbies: string[]
}

export interface PersonExtrasService extends Service {}
export default plugin(
  'personExtras' as Plugin<PersonExtrasService>,
  { core: core.id },
  {
    class: {
      Skill: '' as Ref<Class<Skill>>,
      Experience: '' as Ref<Class<Experience>>,
      Resume: '' as Ref<Class<Resume>>
    },
    mixin: {
      WithResume: '' as Ref<Mixin<WithResume>>
    }
  }
)
