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
import contact from '@anticrm/contact/src/__model__'
import workbench from '@anticrm/workbench/src/__model__'
import { TWithResume } from '@anticrm/person-extras/src/__model__'
import personExtras from '@anticrm/person-extras'

import recruiting, { Candidate, WithCandidateProps } from '.'

@Class$(recruiting.class.Candidate, core.class.Emb)
@UX('Candidate' as IntlString)
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

@Mixin$(recruiting.mixin.WithCandidateProps, personExtras.mixin.WithResume)
export class TWithCandidateProps extends TWithResume implements WithCandidateProps {
  @Prop()
  @InstanceOf$(recruiting.class.Candidate)
  candidate!: Candidate
}

export function model (S: Builder): void {
  S.add(TCandidate, TWithCandidateProps)
  S.createDocument(workbench.class.WorkbenchApplication, {
    route: 'vacancies',
    label: 'Vacancies' as IntlString,
    icon: recruiting.icon.Recruiting,
    component: workbench.component.Application,
    classes: [recruiting.mixin.WithCandidateProps],
    spaceTitle: 'Vacancy',
    supportSpaces: true
  }, recruiting.application.Vacancies)

  S.createDocument(presentation.mixin.Viewlet, {
    displayClass: contact.class.Person,
    label: 'Card' as IntlString,
    component: recruiting.component.CandidateList
  })

  S.mixin(recruiting.mixin.WithCandidateProps, presentation.mixin.CreateForm, {
    component: recruiting.component.NewCandidate
  })

  S.mixin(recruiting.mixin.WithCandidateProps, presentation.mixin.DetailForm, {
    component: recruiting.component.Candidate
  })
}
