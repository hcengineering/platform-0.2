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

import core, { ArrayOf$, Builder, Class$, Mixin$, Prop, RefTo$ } from '@anticrm/model'
import { CORE_CLASS_STRING, Ref, Class, Doc } from '@anticrm/core'
import { Application } from '@anticrm/domains'
import { TDoc } from '@anticrm/model/src/__model__'
import { UX } from '@anticrm/presentation/src/__model__'
import { IntlString } from '@anticrm/platform-i18n'

import fsm, { FSM, Transition, State, WithFSM, WithState } from '.'

const FSMDomain = 'fsm'

@UX('FSM' as IntlString)
@Class$(fsm.class.FSM, core.class.Doc, FSMDomain)
export class TFSM extends TDoc implements FSM {
  @UX('Name' as IntlString)
  @Prop(CORE_CLASS_STRING)
  name!: string

  @RefTo$(core.class.Application)
  application!: Ref<Application>

  @UX('Name' as IntlString)
  @ArrayOf$()
  @RefTo$(fsm.class.Transition)
  transitions!: Ref<Transition>[]

  @UX('TargetClasses' as IntlString)
  @ArrayOf$()
  @RefTo$(core.class.Class)
  classes!: Ref<Class<Doc>>[]
}

@UX('Transition' as IntlString)
@Class$(fsm.class.Transition, core.class.Doc, FSMDomain)
export class TTransition extends TDoc implements Transition {
  @UX('From' as IntlString)
  @RefTo$(fsm.class.State)
  from!: Ref<State>

  @UX('From' as IntlString)
  @RefTo$(fsm.class.State)
  to!: Ref<State>
}

@UX('State' as IntlString)
@Class$(fsm.class.State, core.class.Doc, FSMDomain)
export class TState extends TDoc implements State {
  @UX('Name' as IntlString)
  @Prop(CORE_CLASS_STRING)
  name!: string
}

@Mixin$(fsm.mixin.WithFSM, core.class.Doc)
export class TWithFSM extends TDoc implements WithFSM {
  @UX('FSM' as IntlString)
  @RefTo$(fsm.class.FSM)
  fsm!: Ref<FSM>
}

@Mixin$(fsm.mixin.WithState, core.class.Doc)
export class TWithState extends TDoc implements WithState {
  @UX('FSM' as IntlString)
  @RefTo$(fsm.mixin.WithFSM)
  fsm!: Ref<WithFSM>

  @UX('State' as IntlString)
  @RefTo$(fsm.class.State)
  state!: Ref<State>
}

export function model (S: Builder): void {
  S.add(TTransition, TState, TFSM, TWithFSM, TWithState)
}
