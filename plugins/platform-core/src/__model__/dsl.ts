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

import { Metadata } from '@anticrm/platform'

import {
  Obj, Class, Ref, Doc, Type, RefTo, Bag, AnyFunc, DiffDescriptors, Descriptors,
  PropertyType, BagOf, Embedded, InstanceOf, H
} from '@anticrm/platform-service-data'
// import { mixinPropertyKey } from '../utils'

import core from './id'

type DefClass<T extends E, E extends Obj> = {
  native?: Metadata<T>
  attributes: DiffDescriptors<T, E>
  override?: Partial<Descriptors<E>>
}

export function _class<T extends E, E extends Obj>(
  _id: Ref<Class<T>>, extend: Ref<Class<E>>, def: DefClass<T, E>): H<Class<T>> {
  return {
    _class: core.class.Class as Ref<Class<Class<T>>>,
    _id,
    extends: extend,
    native: def.native,
    attributes: { ...def.attributes, ...def.override }
  }
}

export function ref<T extends Doc>(to: Ref<Class<T>>): H<RefTo<T>> {
  return { _class: core.class.RefTo as Ref<Class<RefTo<T>>>, to }
}

export function bag<T extends PropertyType>(of: Type<T>): BagOf<T> {
  const bag = new TBag
  return { _class: core.class.BagOf as Ref<Class<BagOf<T>>>, of: of as Type<T> }
}

export function instance<T extends Obj>(of: Ref<Class<T>>): H<InstanceOf<T>> {
  return { _class: core.class.InstanceOf as Ref<Class<InstanceOf<T>>>, of }
}

export function metadata<T>(_default?: Metadata<T>): H<Type<Metadata<T>>> {
  return { _class: core.class.Metadata, _default }
}

//////// OPS

export enum Operation {
  Create,
  Mixin,
}

export interface Payload<T extends Obj> {
  obj: H<T>
}

export interface Mixin<T extends Obj> extends Payload<T> {
  _id: Ref<Doc>
}

export interface Event<T extends Obj> {
  op: Operation
  payload: Payload<T>
}

export function create<T extends Doc>(doc: H<T>): Event<T> {
  return { op: Operation.Create, payload: { obj: doc } }
}

export function mixin<T extends Obj>(_id: Ref<Doc>, obj: H<T>): Event<T> {
  return { op: Operation.Mixin, payload: { obj } }
}

export function modelFromEvents(events: Event<Obj>[]): Doc[] {
  const docs = new Map<Ref<Doc>, H<Doc>>()
  events.forEach(event => {
    if (event.op === Operation.Create) {
      const payload = event.payload as Payload<Doc>
      docs.set(payload.obj._id, payload.obj)
    }
  })
  // events.forEach(event => {
  //   if (event.op === Operation.Mixin) {
  //     const payload = event.payload as Mixin<Obj>
  //     const doc = docs.get(payload._id) as any
  //     doc[mixinPropertyKey(payload.obj._class)] = payload.obj
  //   }
  // })
  const result: H<Doc>[] = []
  for (const doc of docs) {
    result.push(doc[1])
  }
  return result as Doc[]
}
