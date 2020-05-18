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
import { Session, Obj, Ref, Class, Doc } from '.'

export default async (platform: Platform): Promise<Session> => {

  const objects = new Map<Ref<Doc>, Doc>()
  const byClass = new Map<Ref<Class<Doc>>, Doc[]>()

  function newDocument<M extends Doc> (_class: Ref<Class<M>>, values: Omit<M, keyof Doc>): M {
    const _id = '' as Ref<M>
    const instance = { _class, _id, ...values } as M
    objects.set(_id, instance)

    return instance
  }


  return {
    newDocument
  } as Session
}