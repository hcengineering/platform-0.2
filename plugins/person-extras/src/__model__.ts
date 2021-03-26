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

import core, { ArrayOf$, Builder, Class$, InstanceOf$, Mixin$, Prop } from '@anticrm/model'
import { TEmb } from '@anticrm/model/src/__model__'
import contact from '@anticrm/contact'
import { TPerson } from '@anticrm/contact/src/__model__'

import personExtras, {
  Experience,
  Skill,
  WithResume,
  Resume
} from '.'

@Class$(personExtras.class.Resume, core.class.Emb)
export class TResume extends TEmb implements Resume {
  @ArrayOf$()
  @InstanceOf$(personExtras.class.Experience)
  experience!: Experience[]

  @ArrayOf$()
  @InstanceOf$(personExtras.class.Skill)
  skills!: Skill[]

  @ArrayOf$()
  profInterests!: string[]

  @ArrayOf$()
  hobbies!: string[]
}
@Mixin$(personExtras.mixin.WithResume, contact.class.Person)
export class TWithResume extends TPerson implements WithResume {
  @Prop()
  @InstanceOf$(personExtras.class.Resume)
  resume!: Resume
}

@Class$(personExtras.class.Experience, core.class.Emb)
export class TExperience extends TEmb implements Experience {
  @Prop(core.class.String) company?: string
  @Prop(core.class.String) project?: string
  @Prop(core.class.Date) startedAt!: Date
  @Prop(core.class.Date) finishedAt?: Date
  @Prop(core.class.String) description?: string
  @Prop(core.class.String) position!: string
  @ArrayOf$()
  @InstanceOf$(personExtras.class.Skill)
  skills!: Skill[]
}

@Class$(personExtras.class.Skill, core.class.Emb)
export class TSkill extends TEmb implements Skill {
  @Prop(core.class.Number) level!: number
  @Prop(core.class.String) skill!: string
}

export function model (S: Builder): void {
  S.add(
    TSkill,
    TExperience,
    TResume,
    TWithResume
  )
}
