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

import { CORE_CLASS_NUMBER, CORE_CLASS_STRING, Ref } from '@anticrm/core'
import core, { ArrayOf$, Builder, Class$, InstanceOf$, Mixin$, Prop, RefTo$, Primary } from '@anticrm/model'
import { TEmb, TVDoc } from '@anticrm/model/src/__model__'
import { IntlString } from '@anticrm/platform-i18n'
import presentation from '@anticrm/presentation'
import { UX } from '@anticrm/presentation/src/__model__'
import workbench from '@anticrm/workbench/src/__model__'
import { TWithResume } from '@anticrm/person-extras/src/__model__'
import personExtras, { Skill } from '@anticrm/person-extras'
import { fsm } from '@anticrm/fsm/src/__model__'

import recruiting, { Candidate, Vacancy, WithCandidateProps } from '.'

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

@Mixin$(recruiting.mixin.WithCandidateProps, personExtras.mixin.WithResume)
export class TWithCandidateProps extends TWithResume implements WithCandidateProps {
  @InstanceOf$(recruiting.class.Candidate)
  candidate!: Candidate

  @UX('Vacancy' as IntlString)
  @RefTo$(recruiting.class.Vacancy)
  vacancy!: Ref<Vacancy>
}

export function model (S: Builder): void {
  createCandidatesAppModel(S)
  createVacanciesAppModel(S)
}

function createCandidatesAppModel (S: Builder): void {
  S.add(TCandidate, TWithCandidateProps)
  S.createDocument(workbench.class.WorkbenchApplication, {
    route: 'candidates',
    label: 'Candidates' as IntlString,
    icon: recruiting.icon.Recruiting,
    component: workbench.component.Application,
    classes: [recruiting.mixin.WithCandidateProps],
    spaceTitle: 'Candidate Pool',
    supportSpaces: true
  }, recruiting.application.Candidates)

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

  const states = {
    rejected: { name: 'Rejected' },
    applied: { name: 'Applied' },
    hrInterview: { name: 'HR interview' },
    testTask: { name: 'Test Task' },
    techInterview: { name: 'Technical interview' },
    offer: { name: 'Offer' },
    contract: { name: 'Contract signing' }
  }

  fsm('Default developer vacancy', recruiting.application.Vacancies, [recruiting.mixin.WithCandidateProps])
    .transition(states.applied, states.hrInterview)
    .transition(states.hrInterview, states.testTask)
    .transition(states.testTask, states.techInterview)
    .transition(states.techInterview, states.offer)
    .transition(states.offer, states.contract)
    .transition(states.applied, states.rejected)
    .transition(states.hrInterview, states.rejected)
    .transition(states.testTask, states.rejected)
    .transition(states.techInterview, states.rejected)
    .transition(states.offer, states.rejected)
    .build(S)

  fsm('Another default vacancy', recruiting.application.Vacancies, [recruiting.mixin.WithCandidateProps])
    .transition(states.applied, states.techInterview)
    .transition(states.techInterview, states.offer)
    .transition(states.applied, states.rejected)
    .transition(states.techInterview, states.rejected)
    .transition(states.offer, states.rejected)
    .build(S)
}
