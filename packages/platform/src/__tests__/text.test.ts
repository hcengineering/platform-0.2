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

/* eslint-env jest */

import { parseMessage, MessageElementKind } from '../text'

describe('easyscript', () => {
  it('should execure easyscript', () => {
    const parsed = parseMessage('hello [[there|class|id]]')
    // console.log(parsed)
    expect(parsed.length).toBe(2)
    expect(parsed[1].kind).toBe(MessageElementKind.LINK)
  })
})
