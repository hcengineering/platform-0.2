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

import { THIS, DUP, GET, APPLY0, APPLY1, ARG0 } from '..'
import { execute } from '../plugin'

describe('easyscript', () => {

  it('should execure easyscript', () => {
    const code = `${THIS},${DUP},getClass,${GET},${APPLY0},${DUP},toString,${GET},${ARG0},${APPLY1}`
    console.log(code)

    const _class = {
      toString: function (plural: string) { return 'Hello ' + plural }
    }

    const _this = {
      getClass: function () { return _class }
    }

    const result = execute(code, _this, ['World!'])
    console.log(result)
    expect(result).toBe('Hello World!')
  })
})