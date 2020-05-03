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

import { Platform } from './platform'
import core, { pluginId, Instance, Obj, Class } from './types'
import { classLabelId } from './utils'

export default {
  pluginId,
  start(platform: Platform) {
    function Obj_toIntlString(this: Instance<Obj>, plural?: number): string {
      const m = this.getClass().toIntlString // temp
      if (m)
        return platform.invoke(this, m, plural)
      return 'todo'
    }

    function Class_toIntlString(this: Instance<Class<Obj>>, plural?: number): string {
      return platform.translate(classLabelId(this._id), { n: plural })
    }

    platform.loadExtensions(core.method, {
      Obj_toIntlString,
      Class_toIntlString
    })
  }
}
