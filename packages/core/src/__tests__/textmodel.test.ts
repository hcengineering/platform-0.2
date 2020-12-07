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
import {
  MessageNode,
  parseMessageMarkdown,
  serializeMessageMarkdown
} from '../textmodel'

describe('server', () => {
  it('Check reference output', async () => {
    const t1 =
      '{"content":[{"content":[{"text":"Hello ","type":"text"},{"marks":[{"attrs":{"class":"class:chunter.Page","id":"5f8043dc1b592de172c26181"},"type":"reference"}],"text":"[[Page1]]","type":"text"},{"text":" and ","type":"text"},{"marks":[{"attrs":{"class":"Page","id":null},"type":"reference"}],"text":"[[Page3]]","type":"text"}],"type":"paragraph"}],"type":"doc"}'
    const msg = serializeMessageMarkdown(JSON.parse(t1) as MessageNode)

    expect(msg).toEqual(
      'Hello [Page1](ref://chunter.Page#5f8043dc1b592de172c26181) and [Page3](ref://Page#)'
    )
  })
  it('check list with bold and italic', async () => {
    const msg = serializeMessageMarkdown(
      JSON.parse(
        '{"content": [{"content": [{"content": [{"content": [{"text": "test1 ", "type": "text"}, {"text": "Italic", "marks": [{"type": "em"}], "type": "text"}], "type": "paragraph"}], "type": "list_item"}, {"content": [{"content": [{"text": "test2 ", "type": "text"}, {"text": "BOLD", "marks": [{"type": "strong"}], "type": "text"}], "type": "paragraph"}], "type": "list_item"}], "type": "bullet_list"}], "type": "doc"}'
      ) as MessageNode
    )

    expect(msg).toEqual('* test1 *Italic*\n\n* test2 **BOLD**')
  })

  // Test parser

  it('Check parsing', async () => {
    const t1 =
      'Hello [Page1](ref://chunter.Page#5f8043dc1b592de172c26181) and [Page3](ref://Page#)'
    const msg = parseMessageMarkdown(t1)
    console.log(msg)
    expect(msg.type).toEqual('doc')

    const md = serializeMessageMarkdown(msg)

    expect(md).toEqual(t1)
  })
})
