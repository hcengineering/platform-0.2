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
import { Class, Emb, Mixin, Ref } from '@anticrm/core'
import core from '@anticrm/platform-core'
import { Plugin, plugin, Service } from '@anticrm/platform'
import { Asset, AnyComponent } from '@anticrm/platform-ui'
import { WithResume } from '@anticrm/person-extras'
import { WorkbenchApplication } from '@anticrm/workbench'

export interface Candidate extends Emb {
  bio: string
  role: string
  salaryExpectation: number
}

export interface WithCandidateProps extends WithResume {
  candidate: Candidate
}

export interface RecruitingService extends Service {}
export default plugin(
  'recruiting' as Plugin<RecruitingService>,
  { core: core.id },
  {
    icon: {
      Recruiting: '' as Asset
    },
    class: {
      Candidate: '' as Ref<Class<Candidate>>
    },
    mixin: {
      WithCandidateProps: '' as Ref<Mixin<WithCandidateProps>>
    },
    component: {
      CandidateList: '' as AnyComponent,
      NewCandidate: '' as AnyComponent,
      Candidate: '' as AnyComponent
    },
    application: {
      Vacancies: '' as Ref<WorkbenchApplication>
    }
  }
)
