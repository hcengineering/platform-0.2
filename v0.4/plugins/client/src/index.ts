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

import { CoreProtocol, Doc, DocumentProtocol, DomainProtocol, Ref } from '@anticrm/core'
import { Plugin, plugin } from '@anticrm/platform'

export type EventListener = (event: unknown) => void

export enum EventType {
  Transaction, // A normal transaction with data modification
  TransientTransaction // A transient transaction with derived data modification.
}

export interface ClientService extends CoreProtocol, DocumentProtocol, DomainProtocol {
  generateId: () => Ref<Doc>
  addEventListener: (type: EventType, listener: EventListener) => void
}

export default plugin(
  'client' as Plugin<ClientService>,
  {},
  {}
)
