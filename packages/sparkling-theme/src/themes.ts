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

export interface Theme {
  name: string,
  colors: {
    ['bg-color']: string
    ['content-color']: string
    ['content-color-dark']: string,
    ['content-bg-color']: string
    ['caption-color']: string
    ['nav-color']: string
    ['separator-color']: string
    ['highlight-color']: string
    ['font-content']: string
    ['editbox-bg-color']: string
  }
}

export const themes: Theme[] = [
  {
    name: 'light',
    colors: {
      ['bg-color']: '#fff',
      ['content-color']: '#505050',
      ['content-color-dark']: 'rgba(101, 96, 92, 0.5)',
      ['content-bg-color']: '#fff',
      ['caption-color']: '#000',
      ['nav-color']: '#E1E1E1',
      ['separator-color']: '#E0E0E0',
      ['highlight-color']: '#235594',
      ['font-content']: `"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`,
      ['editbox-bg-color']: '#F2F2F2',
    },
  },
  {
    name: 'dark',
    colors: {
      ['bg-color']: '#1E1E1E',
      ['content-color']: '#B2B2B2',
      ['content-color-dark']: '#666',
      ['content-bg-color']: '#1E1E1E',
      ['caption-color']: '#fff',
      ['nav-color']: '#333',
      ['separator-color']: '#4D4D4D',
      ['highlight-color']: '#5A92D8',
      ['font-content']: `"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`,
      ['editbox-bg-color']: '#333333',
    },
  },
  {
    name: 'biege',
    colors: {
      ['bg-color']: '#FDF1E6',
      ['content-color']: '#65605C',
      ['content-color-dark']: 'rgba(101, 96, 92, 0.5)',
      ['content-bg-color']: '#FDF1E6',
      ['caption-color']: '#000',
      ['nav-color']: '#EFE0D0',
      ['separator-color']: 'rgba(202, 193, 184, 0.5)',
      ['highlight-color']: '#235594',
      ['font-content']: `"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`,
      ['editbox-bg-color']: '#EFE0D0',
    },
  },
]
