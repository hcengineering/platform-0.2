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

import ru from './strings/ru'

import { Metadata } from '@anticrm/platform'

import { BagOf, InstanceOf, RefTo } from '..'
import { Ref, Class, Obj, Doc, Content, RemoveMethods, PropertyType, Type } from '..'
import { createDocs } from './utils'
import { generateId } from '../objectid'

import core from './id'

type Clear<T> = RemoveMethods<Omit<T, '__embedded' | '_default' | '_mixins'>>

type AsDescrtiptors<T> = { [P in keyof T]: T[P] extends PropertyType ? Type<T[P]> : never }
type Descriptors<T extends object> = AsDescrtiptors<Required<Clear<T>>>
type DiffDescriptors<T extends E, E> = Descriptors<Omit<T, keyof E>>

export function createClass<T extends E, E extends Obj>(
  _id: Ref<Class<T>>, _extends: Ref<Class<E>>,
  attributes: DiffDescriptors<T, E>, native?: Metadata<T>): Class<T> {
  return new Class(core.class.Class as Ref<Class<Class<T>>>, _id, attributes, _extends, native)
}

export function createMixin<T extends E, E extends Obj>(
  _id: Ref<Class<T>>, _extends: Ref<Class<E>>,
  attributes: DiffDescriptors<T, E>, native?: Metadata<T>): Class<T> {
  return new Class(core.class.Class as Ref<Class<Class<T>>>, _id, attributes, _extends, native)
}

export function typeString(): Type<string> { return new Type(core.class.String) }

export function newInstance<T extends Doc>(_class: Ref<Class<T>>, data: Content<T>): T {
  return { _id: generateId(), ...data, _class } as T
}

const model = [
  new Class(core.class.Class, core.class.Object, {
    _class: new RefTo(core.class.Class)
  }, undefined as unknown as Ref<Class<Obj>>, core.native.Object),
  createClass(core.class.Doc, core.class.Object, {
    _id: new RefTo(core.class.Doc)
  }),
  createClass(core.class.Type, core.class.Object, {}, core.native.Type),

  createClass(core.class.RefTo, core.class.Type, {
    to: new RefTo(core.class.Class as Ref<Class<Class<Doc>>>),
  }, core.native.RefTo),
  createClass(core.class.BagOf, core.class.Type, {
    of: new InstanceOf(core.class.Type),
  }, core.native.BagOf),
  createClass(core.class.ArrayOf, core.class.Type, {
    of: new InstanceOf(core.class.Type),
  }, core.native.ArrayOf),
  createClass(core.class.InstanceOf, core.class.Type, {
    of: new RefTo(core.class.Class),
  }, core.native.InstanceOf),

  createClass(core.class.Metadata, core.class.Type, {
  }),
  createClass(core.class.String, core.class.Type, {
  }),

  createClass(core.class.Class, core.class.Doc, {
    attributes: new BagOf(new InstanceOf(core.class.Type)),
    extends: new RefTo(core.class.Class),
    native: new Type(core.class.Metadata)
  })
]

export default {
  strings: {
    ru
  },
  events: createDocs(model)
}
