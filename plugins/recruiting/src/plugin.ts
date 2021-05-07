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
import { Platform } from '@anticrm/platform'

import Candidate from './components/Candidate.svelte'
import CandidateList from './components/CandidateList.svelte'
import NewCandidate from './components/NewCandidate.svelte'

import NewVacancy from './components/NewVacancy.svelte'

import recruiting, { RecruitingService } from '.'

export default async (platform: Platform): Promise<RecruitingService> => {
  platform.setResource(recruiting.component.CandidateList, CandidateList)
  platform.setResource(recruiting.component.NewCandidate, NewCandidate)
  platform.setResource(recruiting.component.Candidate, Candidate)

  platform.setResource(recruiting.component.NewVacancy, NewVacancy)

  return {}
}
