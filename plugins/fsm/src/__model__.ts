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

import core, { ArrayOf$, Builder, Class$, Mixin$, Prop, RefTo$, InstanceOf$ } from '@anticrm/model'
import { CORE_CLASS_STRING, Ref, Class, Doc } from '@anticrm/core'
import { Application } from '@anticrm/domains'
import { TDoc, TEmb } from '@anticrm/model/src/__model__'
import { UX } from '@anticrm/presentation/src/__model__'
import { IntlString } from '@anticrm/platform-i18n'

import fsmPlugin, { FSM, Transition, State, WithFSM, WithState } from '.'

const FSMDomain = 'fsm'

@UX('FSM' as IntlString)
@Class$(fsmPlugin.class.FSM, core.class.Doc, FSMDomain)
export class TFSM extends TDoc implements FSM {
  @UX('Name' as IntlString)
  @Prop(CORE_CLASS_STRING)
  name!: string

  @RefTo$(core.class.Application)
  application!: Ref<Application>

  @UX('Name' as IntlString)
  @ArrayOf$()
  @InstanceOf$(fsmPlugin.class.Transition)
  transitions!: Transition[]

  @UX('TargetClasses' as IntlString)
  @ArrayOf$()
  @RefTo$(core.class.Class)
  classes!: Ref<Class<Doc>>[]
}

@UX('Transition' as IntlString)
@Class$(fsmPlugin.class.Transition, core.class.Emb, FSMDomain)
export class TTransition extends TEmb implements Transition {
  @UX('From' as IntlString)
  @RefTo$(fsmPlugin.class.State)
  from!: Ref<State>

  @UX('From' as IntlString)
  @RefTo$(fsmPlugin.class.State)
  to!: Ref<State>
}

@UX('State' as IntlString)
@Class$(fsmPlugin.class.State, core.class.Doc, FSMDomain)
export class TState extends TDoc implements State {
  @UX('Name' as IntlString)
  @Prop(CORE_CLASS_STRING)
  name!: string
}

@Mixin$(fsmPlugin.mixin.WithFSM, core.class.Doc)
export class TWithFSM extends TDoc implements WithFSM {
  @UX('FSM' as IntlString)
  @RefTo$(fsmPlugin.class.FSM)
  fsm!: Ref<FSM>
}

@Mixin$(fsmPlugin.mixin.WithState, core.class.Doc)
export class TWithState extends TDoc implements WithState {
  @UX('FSM' as IntlString)
  @RefTo$(fsmPlugin.mixin.WithFSM)
  fsm!: Ref<WithFSM>

  @UX('State' as IntlString)
  @RefTo$(fsmPlugin.class.State)
  state!: Ref<State>
}

export function model (S: Builder): void {
  S.add(TTransition, TState, TFSM, TWithFSM, TWithState)
}

type PureState = Omit<State, keyof Doc>
class FSMBuilder {
  private readonly name: string
  private readonly appID: Ref<Application>
  private readonly classes: Ref<Class<Doc>>[]
  private readonly states = new Map<string, PureState>()
  private readonly transitions: [string, string][] = []

  constructor (name: string, appID: Ref<Application>, classes: Ref<Class<Doc>>[]) {
    this.name = name
    this.appID = appID
    this.classes = classes
  }

  private getState (a: PureState) {
    if (!this.states.has(a.name)) {
      this.states.set(a.name, a)
    }

    return this.states.get(a.name)
  }

  transition (a: PureState, b: PureState) {
    const existingA = this.getState(a)
    const existingB = this.getState(b)

    if (!existingA || !existingB) {
      return this
    }

    this.transitions.push([existingA.name, existingB.name])

    return this
  }

  build (S: Builder) {
    const stateIDs = new Map<string, Ref<State>>()

    this.states.forEach((state) => {
      const doc = S.createDocument(fsmPlugin.class.State, state)

      stateIDs.set(state.name, doc._id as Ref<State>)
    })

    const fsm = S.createDocument(fsmPlugin.class.FSM, {
      name: this.name,
      application: this.appID,
      classes: this.classes,
      transitions: this.transitions
        .map(([fromName, toName]) => {
          const from = stateIDs.get(fromName)
          const to = stateIDs.get(toName)

          if (!from || !to) {
            return undefined
          }

          return { from, to } as Transition
        })
        .filter((x): x is Transition => !!x)
    })

    return fsm
  }
}

export const fsm = (
  name: string,
  appID: Ref<Application>,
  classes: Ref<Class<Doc>>[]
): FSMBuilder => new FSMBuilder(name, appID, classes)
