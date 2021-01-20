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
    ['bg-dark-color']: string
    ['bg-accent-color']: string,
    ['content-color']: string
    ['content-dark-color']: string
    ['caption-color']: string
    ['accent-color']: string
    ['highlight-color']: string
    ['highlight-border']: string
    ['content-trans-color']: string
    ['font-content']: string
  }
}

export const themes: Theme[] = [
  {
    name: 'light',
    colors: {
      ['bg-color']: '#fff',
      ['bg-dark-color']: '#E0E0E0',
      ['bg-accent-color']: '#F2F2F2',
      ['content-color']: '#505050',
      ['content-dark-color']: '#333333',
      ['caption-color']: '#000',
      ['accent-color']: '#B92D52',
      ['highlight-color']: '#2D6AB9',
      ['highlight-border']: '#000',
      ['content-trans-color']: 'rgba(255, 255, 255, 0.2)',
      ['font-content']: `"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`,
    },
  },
  {
    name: 'dark',
    colors: {
      ['bg-color']: '#1E1E1E',
      ['bg-dark-color']: '#4D4D4D',
      ['bg-accent-color']: '#333333',
      ['content-color']: '#999999',
      ['content-dark-color']: '#E5E5E5',
      ['caption-color']: '#FFFFFF',
      ['accent-color']: '#B92D52',
      ['highlight-color']: '#2D6AB9',
      ['highlight-border']: '#fff',
      ['content-trans-color']: 'rgba(255, 255, 255, 0.2)',
      ['font-content']: `"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`,
    },
  },
  {
    name: 'biege',
    colors: {
      ['bg-color']: '#FDF1E6',
      ['bg-dark-color']: '#CAC1B8',
      ['bg-accent-color']: '#EFE0D0',
      ['content-color']: '#65605C',
      ['content-dark-color']: '#32302E',
      ['caption-color']: '#000',
      ['accent-color']: '#B92D52',
      ['highlight-color']: '#2D6AB9',
      ['highlight-border']: '#000',
      ['content-trans-color']: 'rgba(0, 0, 0, 0.2)',
      ['font-content']: `"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`,
    },
  },
]
