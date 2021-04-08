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
import core, { Builder, Class$, Enum$, EnumOf$, InstanceOf$, Literal, Mixin$, Prop } from '@anticrm/model'
import { TEmb, TEnum } from '@anticrm/model/src/__model__'
import { IntlString } from '@anticrm/platform-i18n'
import presentation from '@anticrm/presentation'
import { UX } from '@anticrm/presentation/src/__model__'
import workbench from '@anticrm/workbench/src/__model__'
import { TWithResume } from '@anticrm/person-extras/src/__model__'
import personExtras from '@anticrm/person-extras'

import recruiting, { Candidate, CandidateState, WithCandidateProps } from '.'

@UX('Candidate' as IntlString)
@Class$(recruiting.class.Candidate, core.class.Emb)
export class TCandidate extends TEmb implements Candidate {
  @UX('Bio' as IntlString)
  @Prop()
  bio!: string

  @UX('Role' as IntlString)
  @Prop()
  role!: string

  @UX('Expected Salary' as IntlString)
  @Prop()
  salaryExpectation!: number
}

@Enum$(recruiting.enum.State)
class TCandidateState extends TEnum<CandidateState> {
  @Literal(CandidateState) [CandidateState.New]!: any
  @Literal(CandidateState) [CandidateState.DecisionPending]!: any
  @Literal(CandidateState) [CandidateState.OfferSended]!: any
  @Literal(CandidateState) [CandidateState.InProgress]!: any
  @Literal(CandidateState) [CandidateState.Approved]!: any
  @Literal(CandidateState) [CandidateState.Done]!: any
  @Literal(CandidateState) [CandidateState.Rejected]!: any
  @Literal(CandidateState) [CandidateState.InterviewPending]!: any
}

@Mixin$(recruiting.mixin.WithCandidateProps, personExtras.mixin.WithResume)
export class TWithCandidateProps extends TWithResume implements WithCandidateProps {
  @Prop()
  @InstanceOf$(recruiting.class.Candidate)
  candidate!: Candidate

  @EnumOf$(recruiting.enum.State) state!: CandidateState
}

export function model (S: Builder): void {
  S.add(TCandidate, TWithCandidateProps, TCandidateState)
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
    displayClass: recruiting.mixin.WithCandidateProps,
    label: 'Card' as IntlString,
    component: recruiting.component.CandidateList
  })

  S.createDocument(presentation.mixin.Viewlet, {
    displayClass: recruiting.mixin.WithCandidateProps,
    label: 'State' as IntlString,
    component: presentation.component.CardPresenter
  })

  S.createDocument(workbench.class.ItemCreator, {
    app: recruiting.application.Vacancies,
    class: recruiting.mixin.WithCandidateProps,
    name: 'Candidate' as IntlString
  })

  // This is just a temporary example
  S.createDocument(workbench.class.ItemCreator, {
    app: recruiting.application.Vacancies,
    class: recruiting.mixin.WithCandidateProps,
    name: 'Candidate with custom component' as IntlString,
    component: recruiting.component.NewCandidate
  })

  S.mixin(recruiting.mixin.WithCandidateProps, presentation.mixin.CreateForm, {
    component: recruiting.component.NewCandidate
  })

  S.mixin(recruiting.mixin.WithCandidateProps, presentation.mixin.DetailForm, {
    component: recruiting.component.Candidate
  })
}
