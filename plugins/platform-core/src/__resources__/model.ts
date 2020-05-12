//
// Copyright © 2020 Anticrm Platform Contributors.
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

import { Metadata } from '@anticrm/platform'

import { BagOf, InstanceOf, RefTo } from '..'
import { Ref, Class, Obj, Doc, Content, DiffDescriptors, PropertyType, Type, Container, Emb, ArrayOf, Session } from '..'

import core from '.'

export function newContainer<T extends Doc>(_class: Ref<Class<T>>, data: Content<T>): Container {
  return { _classes: [_class as unknown as Ref<Class<Doc>>], ...(data as unknown as Content<Doc>) }
}

export function newStruct<T extends Emb>(_class: Ref<Class<T>>, data: Content<T>): T {
  return { ...data, _class } as T
}

export function createStruct<T extends E, E extends Obj>(
  _id: Ref<Class<T>>, _extends: Ref<Class<E>>,
  _attributes: DiffDescriptors<T, E>, _native?: Metadata<T>) {

  return newContainer(core.class.Struct, {
    _id,
    _attributes,
    _extends,
    _native
  })
}

export function createClass<T extends E, E extends Obj>(
  _id: Ref<Class<T>>, _extends: Ref<Class<E>>,
  _attributes: DiffDescriptors<T, E>, _native?: Metadata<T>) {

  return newContainer(core.class.Class, {
    _id,
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
function obj<T extends Emb>(of: Ref<Class<T>>): InstanceOf<T> {
  return newStruct(core.class.InstanceOf as Ref<Class<InstanceOf<T>>>, { of })
}
function bag<T extends PropertyType>(of: Type<T>): BagOf<T> {
  return newStruct(core.class.BagOf as Ref<Class<BagOf<T>>>, { of })
}
export function array<T extends PropertyType>(of: Type<T>): ArrayOf<T> {
  return newStruct(core.class.ArrayOf as Ref<Class<ArrayOf<T>>>, { of })
}

export const metaModel = [
  newContainer(core.class.Class, {
    _id: core.class.Emb,
    _native: core.native.Emb,
    _attributes: {}
  }),
  newContainer(core.class.Class, {
    _id: core.class.Doc,
    _native: core.native.Doc,
    _attributes: {
      _id: ref(core.class.Doc)
    }
  }),
  createStruct(core.class.Type, core.class.Emb, {}, core.native.Type),
  createStruct(core.class.Metadata, core.class.Type, {}, core.native.Type),
  createStruct(core.class.String, core.class.Type, {}, core.native.Type),

  createStruct(core.class.RefTo, core.class.Type, {
    to: ref(core.class.Class),
  }, core.native.Type),
  createStruct(core.class.BagOf, core.class.Type, {
    of: obj(core.class.Type),
  }, core.native.BagOf),
  createStruct(core.class.ArrayOf, core.class.Type, {
    of: obj(core.class.Type),
  }, core.native.ArrayOf),
  createStruct(core.class.InstanceOf, core.class.Type, {
    of: ref(core.class.Struct),
  }, core.native.InstanceOf),

  createClass(core.class.StructuralFeature, core.class.Doc, {
    _attributes: bag(obj(core.class.Type)),
    _extends: ref(core.class.Struct),
    _native: meta()
  }, core.native.StructuralFeature),

  createClass(core.class.Struct, core.class.StructuralFeature, {
  }, core.native.Struct),

  createClass(core.class.Class, core.class.StructuralFeature, {
  }, core.native.Class)
]

export default (session: Session) => {
  session.loadModel(metaModel)
}