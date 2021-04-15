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
import { Class, Emb, Enum, Mixin, Ref } from '@anticrm/core'
import core from '@anticrm/platform-core'
import { Plugin, plugin, Service } from '@anticrm/platform'
import { Asset, AnyComponent } from '@anticrm/platform-ui'
import { Skill, WithResume } from '@anticrm/person-extras'
import { WorkbenchApplication } from '@anticrm/workbench'
import { VDoc } from '@anticrm/domains'

export interface Candidate extends Emb {
  bio: string
  role: string
  salaryExpectation: number
}

export enum CandidateState {
  New = 'new', // Just added
  InProgress = 'initial', // Some initial discussions are in progress
  InterviewPending = 'interview', // Interview is pending to be complete
  DecisionPending = 'decision', // Decision is pending
  Rejected = 'rejected', // Candidate is rejected
  Approved = 'approved', // Candidate is approved
  OfferSended = 'offer', // We are waiting for candidate to accept/reject offer
  Done = 'done' // Candidate is ok and accepted offer.
}

export interface WithCandidateProps extends WithResume {
  candidate: Candidate
  state: CandidateState
  vacancy?: Ref<Vacancy>
}

export interface Vacancy extends VDoc {
  title: string
  location: string
  description: string
  responsibilities: string[]
  skills: Skill[]
  salary?: number
  salaryMin?: number
  salaryMax?: number
}

export interface RecruitingService extends Service {
}

export default plugin(
  'recruiting' as Plugin<RecruitingService>,
  { core: core.id },
  {
    icon: {
      Recruiting: '' as Asset
    },
    class: {
      Candidate: '' as Ref<Class<Candidate>>,
      Vacancy: '' as Ref<Class<Vacancy>>
    },
    mixin: {
      WithCandidateProps: '' as Ref<Mixin<WithCandidateProps>>
    },
    enum: {
      State: '' as Ref<Enum<CandidateState>>
    },
    component: {
      CandidateList: '' as AnyComponent,
      NewCandidate: '' as AnyComponent,
      Candidate: '' as AnyComponent,
      VacancyList: '' as AnyComponent,
      NewVacancy: '' as AnyComponent,
      Vacancy: '' as AnyComponent
    },
    application: {
      Candidates: '' as Ref<WorkbenchApplication>,
      Vacancies: '' as Ref<WorkbenchApplication>
    }
  }
)
