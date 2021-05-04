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

import { Status } from '@anticrm/status'
import { unknownError, OK } from './status'

type EventListener = (event: string, data: any) => Promise<void>
const PlatformEvent = 'platform-event'

const eventListeners = new Map<string, EventListener[]>()

export function addEventListener (event: string, listener: EventListener): void {
  const listeners = eventListeners.get(event)
  if (listeners !== undefined) {
    listeners.push(listener)
  } else {
    eventListeners.set(event, [listener])
  }
}

export function removeEventListener (event: string, listener: EventListener): void {
  const listeners = eventListeners.get(event)
  if (listeners !== undefined) {
    listeners.splice(listeners.indexOf(listener), 1)
  }
}

export function broadcastEvent (event: string, data: any): void {
  const listeners = eventListeners.get(event)
  if (listeners !== undefined) {
    listeners.forEach((listener) => void listener(event, data)) // eslint-disable-line no-void
  }
}

export function setPlatformStatus (status: Status | Error): void {
  if (status instanceof Error) {
    broadcastEvent(PlatformEvent, unknownError)
  } else {
    broadcastEvent(PlatformEvent, status)
  }
}

export async function monitor<T> (status: Status, promise: Promise<T>): Promise<T> {
  setPlatformStatus(status)
  try {
    const result = await promise
    setPlatformStatus(OK)
    return result
  } catch (err) {
    setPlatformStatus(err)
    throw err
  }
}
