//
// Copyright © 2020 Andrey Platov <andrey.v.platov@gmail.com>
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
//

// import { PropType } from '@anticrm/platform'

import {
  Obj, Class, Ref, Doc, Type, RefTo, Bag, AnyFunc,
  PropertyType, BagOf, Embedded, InstanceOf, SysCall
} from '@anticrm/platform-service-data'

import { IntlString } from '@anticrm/platform-service-i18n'
import { Extension } from '@anticrm/platform-service-extension'

import core from './id'

import { mixinPropertyKey } from '../utils'

// export type Attibutes<T> = Required<{
//   [P in keyof T]: T[P] extends PropType<T> ? Type<T[P]> : never
// }>

export type Attributes<T> = {
  [P in keyof T]: T[P] extends PropertyType ? Type<T[P]> : PropertyType
}

export type Attibutes<T> = Attributes<Required<T>>

type DefClass<T extends E, E extends Obj> = {
  // label?: IntlString
  attributes: Attibutes<Omit<Omit<T, '_default'>, keyof E>>
  override?: Partial<Attibutes<E>>
}

const x = {} as Attibutes<Type<PropertyType>>

//export type Bag<X extends PropertyType> = Record<string, X> & PropType<Record<string, X>>

// type Clear<X extends PropertyType> = Omit<X, '__property'>

// export function embed<X extends PropertyType>(x: Clear<X>): X {
//   return x as X
// }

export function _class<T extends E, E extends Obj>(
  _id: Ref<Class<T>>, extend: Ref<Class<E>>, def: DefClass<T, E>): Class<T> {
  return {
    _class: core.class.Class as Ref<Class<Class<T>>>,
    _id,
    extends: extend,
    // label: def.label ?? '' as IntlString,
    // attributes: embed({ ...def.attributes, ...def.override })
    attributes: { ...def.attributes as Bag<Type<PropertyType>>, ...def.override }
  }
}

// function i<T extends Embedded>(obj: Omit<T, '__property'>): T {
//   return obj as T
// }

export function ref<T extends Doc>(to: Ref<Class<T>>): RefTo<T> {
  return { _class: core.class.RefTo, to }
}

export function bag<T extends PropertyType>(of: Type<T>): BagOf<T> {
  return { _class: core.class.BagOf, of }
}

export function instance<T extends Embedded>(of: Ref<Class<T>>): InstanceOf<T> {
  return { _class: core.class.InstanceOf, of }
}

export function intl(_default?: IntlString): Type<IntlString> {
  return { _class: core.class.IntlString, _default }
}

// export function extension<T>(_default?: Extension<T>): Type<Extension<T>> {
//   return { _class: core.class.Extension, _default }
// }

export function syscall<T extends AnyFunc>(_default?: SysCall<T>): Type<SysCall<T>> {
  return { _class: core.class.SysCall, _default }
}

// export function as_string<T>(_class: Ref<Class<Type<AsString<T>>>>, _default?: AsString<T>): Type<AsString<T>> {
//   return { _class, _default }
// }


export enum Operation {
  Create,
  Mixin,
}

export interface Payload<T extends Obj> {
  obj: T
}

export interface Mixin<T extends Obj> extends Payload<T> {
  _id: Ref<Doc>
}

export interface Event<T extends Obj> {
  op: Operation
  payload: Payload<T>
}

export function create<T extends Doc>(doc: T): Event<T> {
  return { op: Operation.Create, payload: { obj: doc } }
}

export function mixin<T extends Obj>(_id: Ref<Doc>, obj: T): Event<T> {
  return { op: Operation.Mixin, payload: { obj } }
}

export function modelFromEvents(events: Event<Obj>[]): Doc[] {
  const docs = new Map<Ref<Doc>, Doc>()
  events.forEach(event => {
    if (event.op === Operation.Create) {
      const payload = event.payload as Payload<Doc>
      docs.set(payload.obj._id, payload.obj)
    }
  })
  events.forEach(event => {
    if (event.op === Operation.Mixin) {
      const payload = event.payload as Mixin<Obj>
      const doc = docs.get(payload._id) as any
      doc[mixinPropertyKey(payload.obj._class)] = payload.obj
    }
  })
  const result: Doc[] = []
  for (const doc of docs) {
    result.push(doc[1])
  }
  return result
}
