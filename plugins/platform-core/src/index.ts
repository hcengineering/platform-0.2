/*! Antierp Platform
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
*/

import { Plugin, Extension } from './extension'
import core, { pluginId, Obj, Doc, Ref, Class, Mixin, Session, Type, Konstructor, Bag } from './types'
import { model, loadConstructors } from './reflect'
import { translate } from './i18n'
import { classLabelId } from './utils'

@model.Class(core.class.Object)
export class TObject implements Obj {
  _class!: Ref<Class<this>>

  getSession(): Session { throw new Error('object not attached to a session') }
  getClass(): Class<this> { return this.getSession().getInstance(this._class) }
  toIntlString(plural?: number): string { return this.getClass().toIntlString(plural) }
}

@model.Class(core.class.Doc)
export class TDoc extends TObject implements Doc {
  _id!: Ref<this>
  _mixins?: Obj[]

  as<T extends Obj>(mixin: Ref<Mixin<T>>): T { return {} as T }
  mixin<T extends Obj>(mixin: Ref<Mixin<T>>): T { return {} as T }
}

@model.Class(core.class.Class, core.class.Doc)
export class TClass<T extends Obj> extends TDoc implements Class<T> {
  // label!: IntlStringId
  konstructor?: Extension<Konstructor<T>>
  extends?: Ref<Class<Obj>>
  attributes?: Bag<Type>

  toIntlString(plural?: number): string { return translate(classLabelId(this._id), { n: plural }) }
}

@model.Mixin(core.class.Mixin, core.class.Class)
export class TMixin<T extends Obj> extends TClass<T> implements Mixin<T> {
}

export default new Plugin(pluginId, () => {
  loadConstructors(core.class, {
    Object: TObject,
    Doc: TDoc,
    Class: TClass,
    Mixin: TMixin,
  })
})
