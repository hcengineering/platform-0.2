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
import core, { Class, Ref, Obj, Konstructor, Bag, Layout } from './types'

const metadataKey = 'erp:model'

// interface ClassOptions<T extends Doc> {
//   label?: IntlStringId
//   konstructor?: Extension<Konstructor<T>>
// }

export function konstructorId<T extends Obj>(clazz: Ref<Class<T>>): Extension<Konstructor<T>> {
  const id = (clazz as string) + '_Constructor'
  return id as Extension<Konstructor<T>>
}

function structuralDecorator<T extends E, E extends Obj>(kind: Ref<Class<Class<Obj>>>, _id: Ref<Class<T>>, extend?: Ref<Class<E>>, konstructor?: Extension<Konstructor<T>>) {
  return function (target: Konstructor<T>) {
    const clazz: Layout<Class<Obj>> = {
      _id,
      _class: core.class.Class,
      // label: options?.label ?? _id as string as IntlStringId,
      extends: extend,
      konstructor: konstructor ?? konstructorId(_id),
      attributes: Reflect.getOwnMetadata(metadataKey, target)
    }
    Reflect.defineMetadata(metadataKey, clazz, target)
    // registry.set(_id, target)
  }
}

export const model = {
  Class<T extends E, E extends Obj>(_id: Ref<Class<T>>, extend?: Ref<Class<E>>, konstructor?: Extension<Konstructor<T>>) {
    return structuralDecorator(core.class.Class, _id, extend, konstructor)
  },
  Mixin<T extends E, E extends Obj>(_id: Ref<Class<T>>, extend?: Ref<Class<E>>, konstructor?: Extension<Konstructor<T>>) {
    return structuralDecorator(core.class.Mixin, _id, extend, konstructor)
  },
}

/////

export function getClassMetadata(konstructors: Konstructor<Obj>[]): Layout<Class<Obj>>[] {
  return konstructors.map(ctor => Reflect.getOwnMetadata(metadataKey, ctor))
}

///////

type Konstructors<T extends Bag<Ref<Class<Obj>>>> = {
  [P in keyof T]: T[P] extends Ref<Class<infer X>> ? Konstructor<X> : never
}

export function loadConstructors<T extends Bag<Ref<Class<Obj>>>>(ids: T, constructors: Partial<Konstructors<T>>) {
  for (const key in constructors) {
    const id = ids[key]
    const konstructor = constructors[key]
    registry.set(konstructorId(id), konstructor)
  }
}
