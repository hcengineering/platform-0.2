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

import { model, getClassMetadata, loadConstructors } from '../reflect'
import { Class, Ref, Obj, Session } from '../types'
import { identify } from '../extension'

const core = identify('test-reflect', {
  class: {
    Object: '' as Ref<Class<Obj>>,
    Class: '' as Ref<Class<Class<Obj>>>
  }
})

@model.Class(core.class.Object)
class TObject implements Obj {
  _class!: Ref<Class<this>>

  getSession(): Session { throw new Error('object not attached to a session') }
  getClass(): Class<this> { return this.getSession().getInstance(this._class) }
  toIntlString(): string { return this.getClass().toIntlString() }
}

describe('reflect', () => {

  it('should get class metadata', () => {
    const meta = getClassMetadata([TObject])
    expect(meta.length).toBe(1)
    expect(meta[0]._id).toBe(core.class.Object)
  })

  it('should load constructors', () => {
    loadConstructors(core.class, {
      Object: TObject
    })
  })

})
