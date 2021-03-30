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
import core, { Builder, Class$, InstanceOf$, Mixin$, Prop } from '@anticrm/model'
import { TEmb } from '@anticrm/model/src/__model__'
import { IntlString } from '@anticrm/platform-i18n'
import presentation from '@anticrm/presentation'
import { UX } from '@anticrm/presentation/src/__model__'
import contact, { TPerson } from '@anticrm/contact/src/__model__'
import workbench from '@anticrm/workbench/src/__model__'

import candidate, { Candidate, WithCandidateProps } from '.'

@Class$(candidate.class.Candidate, core.class.Emb)
export class TCandidate extends TEmb implements Candidate {
  @Prop()
  @UX('Bio' as IntlString)
  bio!: string

  @Prop()
  @UX('Role' as IntlString)
  role!: string

  @Prop()
  @UX('Expected Salary' as IntlString)
  salaryExpectation!: number
}

@Mixin$(candidate.mixin.WithCandidateProps, contact.class.Person)
export class TWithCandidateProps extends TPerson implements WithCandidateProps {
  @Prop()
  @InstanceOf$(candidate.class.Candidate)
  candidate!: Candidate
}

export function model (S: Builder): void {
  S.add(TCandidate, TWithCandidateProps)
  S.createDocument(workbench.class.WorkbenchApplication, {
    route: 'candidates',
    label: 'Candidates' as IntlString,
    icon: candidate.icon.Candidate,
    rootComponent: workbench.component.Application,
    classes: [candidate.mixin.WithCandidateProps],
    supportSpaces: false
  }, candidate.application.Candidate)

  S.createDocument(presentation.mixin.Viewlet, {
    displayClass: contact.class.Person,
    label: 'Card' as IntlString,
    component: candidate.component.CandidateList
  })

  S.mixin(candidate.mixin.WithCandidateProps, presentation.mixin.CreateForm, {
    component: candidate.component.NewCandidate
  })

  S.mixin(candidate.mixin.WithCandidateProps, presentation.mixin.DetailForm, {
    component: candidate.component.Candidate
  })
}
