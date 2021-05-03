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

import { Status, Severity } from '@anticrm/status'

type EventListener = (event: string, data: any) => Promise<void>
export const PlatformStatus = 'platform-status'

const eventListeners = new Map<string, EventListener[]>()

export function addEventListener (event: string, listener: EventListener): void {
  const listeners = eventListeners.get(event)
  if (listeners != null) {
    listeners.push(listener)
  } else {
    eventListeners.set(event, [listener])
  }
}

export function removeEventListener (event: string, listener: EventListener): void {
  const listeners = eventListeners.get(event)
  if (listeners != null) {
    listeners.splice(listeners.indexOf(listener), 1)
  }
}

export function broadcastEvent (event: string, data: any): void {
  const listeners = eventListeners.get(event)
  if (listeners != null) {
    listeners.forEach((listener) => void listener(event, data)) // eslint-disable-line no-void
  }
}

export function setPlatformStatus (status: Status | Error | string | unknown): void {
  if (typeof status === 'string') {
    broadcastEvent(PlatformStatus, new Status(Severity.INFO, 0, status))
  } else if (status instanceof Error) {
    const err = status
    broadcastEvent(PlatformStatus, new Status(Severity.ERROR, 0, err.message))
  } else if (status instanceof Status) {
    broadcastEvent(PlatformStatus, status)
  } else {
    broadcastEvent(PlatformStatus, new Status(Severity.WARNING, 0, `Unknown status: ${String(status)}`))
  }
}

export async function monitor<T> (status: Status, promise: Promise<T>): Promise<T> {
  setPlatformStatus(status)
  try {
    const result = await promise
    setPlatformStatus(new Status(Severity.OK, 0, ''))
    return result
  } catch (err) {
    setPlatformStatus(err)
    throw err
  }
}
