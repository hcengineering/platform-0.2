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

import { AsString, Plugin, PluginId } from '@anticrm/platform'

/*

function toString(this: Obj, plural?: number) { 
  return this.getClass().toString(plural)
}

translates to:

THIS // [this]
DUP // [this, this]
getClass // [this, this, getClass]
GET  // stack: [this, <function>getClass]
APPLY0 // stack: [<class' this>]
DUP // stack: [<class' this>, <class' this>]
toString // stack: [<class' this>, <class' this>, 'toString']
GET // stack [<class' this>, <function>toString]
ARG0 // stack [<class' this>, <function>toString, plural]
APPLY1 // stack [<result>]

*/

export const THIS = '#0'
export const DUP = '#1'
export const GET = '#2'
export const APPLY0 = '#3'
export const APPLY1 = '#4'
export const ARG0 = '#5'

export type AnyFunc = (...args: any[]) => any
export type EasyScript<M extends AnyFunc> = AsString<M> & { __easyscript: void }

export const pluginId = 'easyscript' as PluginId<EasyScriptPlugin>
export interface EasyScriptPlugin extends Plugin {
  get<M extends AnyFunc>(code: EasyScript<M>): M
}

