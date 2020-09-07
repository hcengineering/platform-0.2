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

import 'reflect-metadata'
import { Ref, Class, Obj, Mixin, ClassifierKind, Classifier, Attribute, Type, Emb } from '@anticrm/platform'
import core from '.'

const classifierMetadataKey = Symbol("anticrm:classifier");

function getClassifier (target: any): Classifier<Obj> {
  let classifier = Reflect.getOwnMetadata(classifierMetadataKey, target) as Classifier<Obj>
  if (!classifier) {
    classifier = {
      _attributes: {}
    } as Classifier<Obj>
    Reflect.defineMetadata(classifierMetadataKey, classifier, target)
  }
  console.log('target: ', target)
  console.log('target proto: ', target.prototype)
  console.log('target proto proto: ', target.prototype.prototype)
  return classifier
}

function getAttribute (target: any, propertyKey: string): Attribute {
  const classifier = getClassifier(target)
  let attribute = (classifier._attributes as any)[propertyKey] as Attribute
  if (!attribute) {
    attribute = {
      _class: core.class.Attribute
    } as unknown as Attribute
    (classifier._attributes as any)[propertyKey] = attribute
  }
  return attribute
}


export function ModelClass<T extends Obj> (id: Ref<Class<T>>) {

  return function classDecorator<C extends { new(): T }> (
    constructor: C
  ) {
    const classifier = getClassifier(constructor)
    classifier._class = core.class.Class
    classifier._kind = ClassifierKind.CLASS
  }

}

export function ModelMixin<T extends Obj> (id: Ref<Mixin<T>>) {

  return function classDecorator<C extends { new(): T }> (
    constructor: C
  ) {
    const classifier = getClassifier(constructor)
    classifier._class = core.class.Mixin
    classifier._kind = ClassifierKind.MIXIN
  }

}

export function Prop () {

  return function (target: any, propertyKey: string): void {
    const attribute = getAttribute(target, propertyKey)
    const type = { _class: core.class.Type } as unknown as Type
    attribute.type = type
  }
}

////////////////////////////////////////////////////////////////

@ModelClass(core.class.Obj)
class TObj implements Obj {
  _class!: Ref<Class<Obj>>
}

@ModelClass(core.class.Emb)
class TEmb extends TObj implements Emb {
  __embedded!: true
}

export default [TObj, TEmb]
