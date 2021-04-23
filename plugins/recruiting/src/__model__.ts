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
import core, {
  ArrayOf$, Builder, Class$, Enum$, EnumOf$, InstanceOf$, Literal, Mixin$, Primary, Prop, RefTo$
} from '@anticrm/model'
import { TEmb, TEnum, TVDoc } from '@anticrm/model/src/__model__'
import { IntlString } from '@anticrm/platform-i18n'
import presentation from '@anticrm/presentation'
import { UX } from '@anticrm/presentation/src/__model__'
import workbench from '@anticrm/workbench/src/__model__'
import { TWithResume } from '@anticrm/person-extras/src/__model__'
import personExtras, { Skill } from '@anticrm/person-extras'

import recruiting, { Candidate, CandidateState, Vacancy, WithCandidateProps } from '.'
import { CORE_CLASS_NUMBER, CORE_CLASS_STRING, Ref } from '@anticrm/core'

const VacanciesDomain = 'vacancies'

@UX('Candidate' as IntlString)
@Class$(recruiting.class.Candidate, core.class.Emb)
export class TCandidate extends TEmb implements Candidate {
  @UX('Bio' as IntlString)
  @Prop(CORE_CLASS_STRING)
  bio!: string

  @UX('Role' as IntlString)
  @Prop(CORE_CLASS_STRING)
  role!: string

  @UX('Expected Salary' as IntlString)
  @Prop(CORE_CLASS_NUMBER)
  salaryExpectation!: number
}

@UX('Vacancy' as IntlString)
@Class$(recruiting.class.Vacancy, core.class.VDoc, VacanciesDomain)
export class TVacancy extends TVDoc implements Vacancy {
  @Primary()
  @Prop(CORE_CLASS_STRING)
  title!: string

  @Prop(CORE_CLASS_STRING)
  description!: string

  @Prop(CORE_CLASS_STRING)
  location!: string

  @ArrayOf$()
  @InstanceOf$(CORE_CLASS_STRING)
  responsibilities!: string[]

  @ArrayOf$()
  @InstanceOf$(personExtras.class.Skill)
  skills!: Skill[]

  @Prop(CORE_CLASS_NUMBER)
  salary?: number

  @Prop(CORE_CLASS_NUMBER)
  salaryMin?: number

  @Prop(CORE_CLASS_NUMBER)
  salaryMax?: number
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
  @InstanceOf$(recruiting.class.Candidate)
  candidate!: Candidate

  @EnumOf$(recruiting.enum.State) state!: CandidateState

  @UX('Vacancy' as IntlString)
  @RefTo$(recruiting.class.Vacancy)
  vacancy!: Ref<Vacancy>
}

export function model (S: Builder): void {
  createCandidatesAppModel(S)
  createVacanciesAppModel(S)
}

function createCandidatesAppModel (S: Builder): void {
  S.add(TCandidate, TWithCandidateProps, TCandidateState)
  S.createDocument(workbench.class.WorkbenchApplication, {
    route: 'candidates',
    label: 'Candidates' as IntlString,
    icon: recruiting.icon.Recruiting,
    component: workbench.component.Application,
    classes: [recruiting.mixin.WithCandidateProps],
    spaceTitle: 'Candidate Pool',
    supportSpaces: true
  }, recruiting.application.Candidates)

  S.createDocument(core.class.Space, {
    name: 'Candidates',
    description: '',
    application: recruiting.application.Candidates,
    isPublic: true,
    archived: false,
    spaceKey: 'CANDIDATES',
    users: []
  })

  S.createDocument(workbench.class.ItemCreator, {
    app: recruiting.application.Candidates,
    class: recruiting.mixin.WithCandidateProps,
    name: 'Candidate' as IntlString
  })

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

  S.mixin(recruiting.mixin.WithCandidateProps, presentation.mixin.CreateForm, {
    component: recruiting.component.NewCandidate
  })

  S.mixin(recruiting.mixin.WithCandidateProps, presentation.mixin.DetailForm, {
    component: recruiting.component.Candidate
  })
}

function createVacanciesAppModel (S: Builder): void {
  S.add(TVacancy)
  S.createDocument(workbench.class.WorkbenchApplication, {
    route: 'vacancies',
    label: 'Vacancies' as IntlString,
    icon: recruiting.icon.Recruiting,
    component: workbench.component.Application,
    classes: [recruiting.class.Vacancy],
    spaceTitle: 'Company',
    supportSpaces: true
  }, recruiting.application.Vacancies)

  S.createDocument(core.class.Space, {
    name: 'My company', // TODO: Name should be at least workspace org
    description: '',
    application: recruiting.application.Vacancies,
    isPublic: true,
    archived: false,
    spaceKey: 'VAC_DEFAULT',
    users: []
  })

  S.createDocument(workbench.class.ItemCreator, {
    app: recruiting.application.Vacancies,
    class: recruiting.class.Vacancy,
    name: 'Vacancy' as IntlString
  })

  S.createDocument(presentation.mixin.Viewlet, {
    displayClass: recruiting.class.Vacancy,
    label: 'Card' as IntlString,
    component: recruiting.component.VacancyList
  })

  S.mixin(recruiting.class.Vacancy, presentation.mixin.CreateForm, {
    component: recruiting.component.NewVacancy
  })

  S.mixin(recruiting.class.Vacancy, presentation.mixin.DetailForm, {
    component: recruiting.component.Vacancy
  })
}
