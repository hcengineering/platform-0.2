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

export type Resource<T> = string & { __resource: T }
export type Property<T> = { __property: T }

export type Ref<T extends Doc> = string & { __ref: T } & Resource<T>
export type PropertyType = Property<any>
  | Emb
  | undefined
  | PropertyType[]
  | { [key: string]: PropertyType }

export interface Obj { _class: Ref<Class> }
export interface Emb extends Obj { __embedded: true }
export interface Doc extends Obj {
  _id: Ref<Doc>
  _mixins?: Ref<Class>[]
}

export interface Type<A> extends Emb {
  _default?: Property<A>
}

export interface Classifier extends Doc {
  _attributes: { [key: string]: Type<any> }
}

export enum CoreDomain {
  Model = 'model'
}

export interface Class extends Classifier {
  _extends?: Ref<Class>
  _native?: Property<Object>
  _domain?: Property<string>
}
