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

import { IntlString, Extension } from '../platform'
import {
  Obj, Class, Ref, Doc, Type, RefTo,
  PropertyType, BagOf, Embedded, InstanceOf
} from '../types'
import core from './id'

export type Attibutes<T> = Required<{
  [P in keyof T]: T[P] extends PropertyType ? Type<T[P]> : never
}>

type DefClass<T extends E, E extends Obj> = {
  // label?: IntlString
  attributes: Attibutes<Omit<T, keyof E>>
  override?: Partial<Attibutes<E>>
}

export function _class<T extends E, E extends Obj>(
  _id: Ref<Class<T>>, extend: Ref<Class<E>>, def: DefClass<T, E>): Class<T> {
  return {
    _class: core.class.Class as Ref<Class<Class<T>>>,
    _id,
    extends: extend,
    // label: def.label ?? '' as IntlString,
    attributes: { ...def.attributes, ...def.override }
  }
}

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

export function extension<T>(_default?: Extension<T>): Type<Extension<T>> {
  return { _class: core.class.Extension, _default }
}
