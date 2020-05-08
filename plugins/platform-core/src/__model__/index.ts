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
import { Ref, Class, Obj, Doc, Content, RemoveMethods, PropertyType, Type, Container, Embedded, ArrayOf } from '..'

import core from './id'

export function newContainer<T extends Doc>(_class: Ref<Class<T>>, _id: Ref<T>, data: ClearInstance<T>): Container {
  return { _classes: [_class], _id, ...data }
}

type ClearInstance<T> = RemoveMethods<Omit<T, '_class' | '_id'>>

export function newStruct<T extends Embedded>(_class: Ref<Class<T>>, data: ClearInstance<T>): T {
  return { ...data, _class } as T
}

type Clear<T> = RemoveMethods<Omit<T, '_class'>>
type AsDescrtiptors<T> = { [P in keyof T]: T[P] extends PropertyType ? Type<T[P]> : never }
type Descriptors<T extends object> = AsDescrtiptors<Required<Clear<T>>>
type DiffDescriptors<T extends E, E> = Descriptors<Omit<T, keyof E>>

export function createStruct<T extends E, E extends Obj>(
  _id: Ref<Class<T>>, _extends: Ref<Class<E>>,
  _attributes: DiffDescriptors<T, E>, _native?: Metadata<T>) {

  return newContainer(core.class.Struct, _id, {
    _attributes,
    _extends,
    _native
  })
}

export function createDocument<T extends E, E extends Obj>(
  _id: Ref<Class<T>>, _extends: Ref<Class<E>>,
  _attributes: DiffDescriptors<T, E>, _native?: Metadata<T>) {

  return newContainer(core.class.Document, _id, {
    _attributes,
    _extends,
    _native
  })
}

export function str(): Type<string> { return newStruct(core.class.String, {}) }

function meta<T>(): Type<Metadata<T>> { return newStruct(core.class.Metadata, {}) }

function ref<T extends Doc>(to: Ref<Class<T>>): RefTo<T> {
  return newStruct(core.class.RefTo as unknown as Ref<Class<RefTo<T>>>, { to })
}

function obj<T extends Embedded>(of: Ref<Class<T>>): InstanceOf<T> {
  return newStruct(core.class.InstanceOf as Ref<Class<InstanceOf<T>>>, { of })
}

function bag<T extends PropertyType>(of: Type<T>): BagOf<T> {
  return newStruct(core.class.BagOf as Ref<Class<BagOf<T>>>, { of })
}

export function array<T extends PropertyType>(of: Type<T>): ArrayOf<T> {
  return newStruct(core.class.ArrayOf as Ref<Class<ArrayOf<T>>>, { of })
}

const embeddedAttributes: Descriptors<Embedded> = {
}
const embeddedClass = newContainer(core.class.Document, core.class.Embedded, {
  _attributes: embeddedAttributes,
  _native: core.native.Embedded
})

const docAttributes: Descriptors<Doc> = {
  _id: ref(core.class.Doc)
}
const docClass = newContainer(core.class.Document, core.class.Doc, {
  _attributes: docAttributes,
  _native: core.native.Doc
})

const model = [
  embeddedClass,
  docClass,

  createStruct(core.class.Type, core.class.Embedded, {}, core.native.Type),
  createStruct(core.class.Metadata, core.class.Type, {}, core.native.Type),
  createStruct(core.class.String, core.class.Type, {}, core.native.Type),

  createStruct(core.class.RefTo, core.class.Type, {
    to: ref(core.class.Document),
  }, core.native.Type),
  createStruct(core.class.BagOf, core.class.Type, {
    of: obj(core.class.Type),
  }, core.native.BagOf),
  createStruct(core.class.ArrayOf, core.class.Type, {
    of: obj(core.class.Type),
  }, core.native.ArrayOf),
  createStruct(core.class.InstanceOf, core.class.Type, {
    of: ref(core.class.Document),
  }, core.native.InstanceOf),

  createDocument(core.class.Struct, core.class.Doc, {
    _attributes: bag(obj(core.class.Type)),
    _extends: ref(core.class.Struct),
    _native: meta()
  }, core.native.Struct),

  createDocument(core.class.Document, core.class.Doc, {
    _attributes: bag(obj(core.class.Type)),
    _extends: ref(core.class.Document),
    _native: meta()
  }, core.native.Document)
]

export default {
  strings: {
    ru
  },
  model
}
