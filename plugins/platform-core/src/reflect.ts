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

import 'reflect-metadata'

import registry, { Extension } from './extension'
import { IntlStringId } from './i18n'
import core, { Class, Ref, Obj, Konstructor, Bag, Layout } from './types'

const metadataKey = 'erp:model'

type ClassLayout = Layout<Class<Obj>>

function getOrCreateMetadata(target: any) {
  let clazz = Reflect.getOwnMetadata(metadataKey, target)
  if (!clazz) {
    clazz = {}
    Reflect.defineMetadata(metadataKey, clazz, target)
  }
  return clazz
}

interface ClassOptions<T extends E, E extends Obj> {
  extends?: Ref<Class<E>>
  label?: IntlStringId
  konstructor?: Extension<Konstructor<T>>
}

export function Model<T extends E, E extends Obj>(_id: Ref<Class<T>>, options?: ClassOptions<T, E>) {
  return function (target: Konstructor<T>) {
    const clazz: ClassLayout = {
      _id,
      _class: core.class.Class,
      label: options?.label ?? _id as string as IntlStringId,
      extends: options?.extends,
      konstructor: options?.konstructor ?? _id as string as Extension<Konstructor<T>>,
      attributes: getOrCreateMetadata(target.prototype)
    }
    Reflect.defineMetadata(metadataKey, clazz, target.prototype)
    // registry.set(_id, target)
  }
}

export function getClassMetadata<T extends Obj>(konstructor: Konstructor<T>): ClassLayout {
  return Reflect.getOwnMetadata(metadataKey, konstructor.prototype)
}

///////

type Konstructors<T extends Bag<Ref<Class<Obj>>>> = {
  [P in keyof T]: T[P] extends Ref<Class<infer X>> ? Konstructor<X> : never
}

export function loadConstructors<T extends Bag<Ref<Class<Obj>>>>(ids: T, constructors: Partial<Konstructors<T>>) {
  for (const key in constructors) {
    const id = ids[key]
    const konstructor = constructors[key]
    registry.set(id, konstructor)
  }
}
