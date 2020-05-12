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

import { Platform } from '@anticrm/platform'
import { EasyScriptPlugin, pluginId, EasyScript, AnyFunc, THIS, DUP, GET, APPLY0, APPLY1, ARG0 } from '..'

// Exported for Tests & Benchmarks
export function execute(code: string, thisArg: object, args: any[]) {
  const split = code.split(',')
  const stack: any[] = []
  const len = split.length

  function apply(args: any[]) {
    const f = stack.pop()
    const _this = stack.pop()
    if (typeof f !== 'function') {
      throw new Error('APPLY: f must be a function.')
    }
    stack.push((f as Function).apply(_this, args))
  }

  for (let pc = 0; pc < len; pc++) {
    const word = split[pc]
    switch (word) {
      case THIS:
        stack.push(thisArg)
        break
      case DUP:
        const x = stack.pop()
        stack.push(x)
        stack.push(x)
        break
      case GET:
        const key = stack.pop()
        const obj = stack.pop()
        if (typeof key !== 'string')
          throw new Error('GET: key must be a string.')
        stack.push(obj[key])
        break
      case APPLY0:
        apply([])
        break
      case APPLY1:
        apply([stack.pop()])
        break
      case ARG0:
        stack.push(args[0])
        break
      default:
        stack.push(word)
    }
  }

  if (stack.length !== 1) {
    throw new Error('stack size != 1')
  }
  return stack.pop()

}

export default (platform: Platform): EasyScriptPlugin => ({
  platform,
  pluginId,
  get<M extends AnyFunc>(code: EasyScript<M>): M {
    return function (this: any, ...args: any[]) {
      return execute(code as string, this, args)
    } as M
  }
})
