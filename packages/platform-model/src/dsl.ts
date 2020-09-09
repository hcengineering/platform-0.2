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
import { Ref, Class, Obj, Mixin, ClassifierKind, Classifier, Attribute, Type, Emb, Doc, Property, mixinKey } from '@anticrm/platform'
import core from '.'

const classifierMetadataKey = Symbol("anticrm:classifier");

export function getClassifier (target: any): Classifier<Obj> {
  let classifier = Reflect.getOwnMetadata(classifierMetadataKey, target) as Classifier<Obj>
  if (!classifier) {
    classifier = {
      _attributes: {}
    } as Classifier<Obj>
    Reflect.defineMetadata(classifierMetadataKey, classifier, target)
  }
  return classifier
}

export function getAttribute (target: any, propertyKey: string): Attribute {
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


export function ModelClass<T extends E, E extends Obj> (id: Ref<Class<T>>, _extends: Ref<Class<E>>, domain?: string) {

  return function classDecorator<C extends { new(): T }> (
    constructor: C
  ) {
    const classifier = getClassifier(constructor.prototype)
    classifier._id = id
    classifier._class = core.class.Class
    classifier._kind = ClassifierKind.CLASS
    if (id !== _extends) {
      classifier._extends = _extends
    }
    if (domain) {
      (classifier as Class<T>)._domain = domain as Property<string, string>
    }
  }

}

export function ModelMixin<T extends E, E extends Obj> (id: Ref<Mixin<T>>, _extends: Ref<Classifier<E>>) {

  return function classDecorator<C extends { new(): T }> (
    constructor: C
  ) {
    const classifier = getClassifier(constructor.prototype)
    classifier._id = id
    classifier._class = core.class.Mixin
    classifier._kind = ClassifierKind.MIXIN
    classifier._extends = _extends
  }

}

export function Prop () {

  return function (target: any, propertyKey: string): void {
    const attribute = getAttribute(target, propertyKey)
    const type = { _class: core.class.Type } as unknown as Type
    attribute.type = type
  }
}

export function Primary () {

  return function (target: any, propertyKey: string): void {
    const classifier = getClassifier(target)
    if (!classifier._mixins) {
      classifier._mixins = [core.mixin.Indices]
    } else {
      classifier._mixins.push(core.mixin.Indices)
    }
    const doc = classifier as any
    doc[mixinKey(core.mixin.Indices, 'primary')] = propertyKey
  }
}





