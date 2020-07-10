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

import { App, inject } from 'vue'
import { Metadata, Platform, plugin, Plugin, Resource, Service } from '@anticrm/platform'

export type URL = string
export type Asset = Metadata<URL>

export type VueConstructor = object
export type Component<C extends VueConstructor> = Resource<C>
export type AnyComponent = Component<VueConstructor>

export interface Location {
  app: string | undefined
  path: string[]
}

export interface UIService extends Service {
  getApp(): App

  navigate(url: string): void

  getLocation(): Location
}

export const PlatformInjectionKey = Symbol('platform')
export const UIInjectionKey = Symbol('platform-ui')

export function getPlatform() {
  return inject(PlatformInjectionKey) as Platform
}

export function getUIService() {
  return inject(UIInjectionKey) as UIService
}

export default plugin('vue' as Plugin<UIService>, {}, {
  metadata: {
    DefaultApplication: '' as Metadata<AnyComponent>
  },
  icon: {
    Default: '' as Asset,
    Network: '' as Asset
  },
  component: {
    Spinner: '' as AnyComponent,
    BadComponent: '' as AnyComponent
  },
  method: {
    AnAction: '' as Resource<(args: any) => void>
  }
})
