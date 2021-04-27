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
import { CORE_CLASS_STRING, Ref, Class, Doc, MODEL_DOMAIN } from '@anticrm/core'
import { Application } from '@anticrm/domains'
import { TDoc, TEmb, TMixin } from '@anticrm/model/src/__model__'
import { UX } from '@anticrm/presentation/src/__model__'
import { IntlString } from '@anticrm/platform-i18n'

import fsmPlugin, { FSM, Transition, State, WithFSM, WithState } from '.'

@UX('FSM' as IntlString)
@Class$(fsmPlugin.class.FSM, core.class.Doc, MODEL_DOMAIN)
export class TFSM extends TDoc implements FSM {
  @UX('Name' as IntlString)
  @Prop(CORE_CLASS_STRING)
  name!: string

  @RefTo$(core.class.Application)
  application!: Ref<Application>

  @UX('Name' as IntlString)
  @ArrayOf$()
  @RefTo$(fsmPlugin.class.Transition)
  transitions!: Array<Ref<Transition>>

  @UX('TargetClasses' as IntlString)
  @ArrayOf$()
  @RefTo$(core.class.Class)
  classes!: Array<Ref<Class<VDoc>>>
}

@UX('Transition' as IntlString)
@Class$(fsmPlugin.class.Transition, core.class.Doc, MODEL_DOMAIN)
export class TTransition extends TEmb implements Transition {
  @UX('From' as IntlString)
  @RefTo$(fsmPlugin.class.State)
  from!: Ref<State>

  @UX('From' as IntlString)
  @RefTo$(fsmPlugin.class.State)
  to!: Ref<State>
}

@UX('State' as IntlString)
@Class$(fsmPlugin.class.State, core.class.Doc, MODEL_DOMAIN)
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

@Mixin$(fsmPlugin.mixin.CardForm, core.class.Mixin)
export class TCardForm<T extends VDoc> extends TMixin<T> implements ComponentExtension<T> {
  @Prop()
  component!: AnyComponent
}

export function model (S: Builder): void {
  S.add(TTransition, TState, TFSM, TWithFSM, TWithState, TCardForm)

  S.mixin(core.class.VDoc, fsmPlugin.mixin.CardForm, {
    component: fsmPlugin.component.VDocCardPresenter
  })
}

type PureState = Omit<State, keyof Doc>
class FSMBuilder {
  private readonly name: string
  private readonly appID: Ref<Application>
  private readonly classes: Array<Ref<Class<Doc>>>
  private readonly states = new Map<string, PureState>()
  private readonly transitions: Array<[string, string]> = []

  constructor (name: string, appID: Ref<Application>, classes: Array<Ref<Class<Doc>>>) {
    this.name = name
    this.appID = appID
    this.classes = classes
  }

  private getState (a: PureState): PureState | undefeined {
    if (!this.states.has(a.name)) {
      this.states.set(a.name, a)
    }

    return this.states.get(a.name)
  }

  private _transition (a: PureState, b: PureState): FSMBuilder {
    const existingA = this.getState(a)
    const existingB = this.getState(b)

    if ((existingA == null) || (existingB == null)) {
      return this
    }

    this.transitions.push([existingA.name, existingB.name])

    return this
  }

  // TODO: in future PureState will become {state: PureState, action: any}
  transition (a: PureState, b: PureState | PureState[]): FSMBuilder {
    (Array.isArray(b) ? b : [b])
      .forEach(x => this._transition(a, x))

    return this
  }

  build (S: Builder): FSM {
    const stateIDs = new Map<string, Ref<State>>()

    this.states.forEach((state) => {
      const doc = S.createDocument(fsmPlugin.class.State, state)

      stateIDs.set(state.name, doc._id as Ref<State>)
    })

    const transitions: Array<Ref<Transition>> = []

    this.transitions.forEach(([fromName, toName]) => {
      const from = stateIDs.get(fromName)
      const to = stateIDs.get(toName)

      if ((from == null) || (to == null)) {
        return
      }

      const doc = S.createDocument(fsmPlugin.class.Transition, {
        from,
        to
      })

      transitions.push(doc._id)
    })

    const fsm = S.createDocument(fsmPlugin.class.FSM, {
      name: this.name,
      application: this.appID,
      classes: this.classes,
      transitions
    })

    return fsm
  }
}

export const fsm = (
  name: string,
  appID: Ref<Application>,
  classes: Array<Ref<Class<Doc>>>
): FSMBuilder => new FSMBuilder(name, appID, classes)
