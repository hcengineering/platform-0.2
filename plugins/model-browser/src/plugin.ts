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

import type { Platform } from '@anticrm/platform'
import mb, { ModelBrowserService } from '.'
import ClassProperties from './components/internal/ClassProperties.svelte'
import AttributePresenter from './components/internal/AttributePresenter.svelte'
import ModelBrowser from './components/internal/ModelBrowser.svelte'

/*!
 * Anticrm Platform™ Task Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform): Promise<ModelBrowserService> => {
  platform.setResource(mb.component.ModelBrowser, ModelBrowser)
  platform.setResource(mb.component.ClassProperties, ClassProperties)
  platform.setResource(mb.component.AttributePresenter, AttributePresenter)
  return {}
}
