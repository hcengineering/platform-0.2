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

import { Obj, Doc, Ref } from '../types'
import { mixinPropertyKey } from '../utils'

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
