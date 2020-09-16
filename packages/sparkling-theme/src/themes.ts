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
    ['nav-color']: string
    ['separator-color']: string
    ['highlight-color']: string
    ['font-content']: string
  }
}

export const themes: Theme[] = [
  {
    name: 'light',
    colors: {
      ['bg-color']: '#282230',
      ['content-color']: '#f1f1f1',
      ['content-color-dark']: '#888',
      ['content-bg-color']: '#1b1c21',
      ['nav-color']: '#161616',
      ['separator-color']: '#404040',
      ['highlight-color']: '#19A0FB',
      ['font-content']: `"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`
    },
  },
  {
    name: 'dark',
    colors: {
      ['bg-color']: '#1b1c21',
      ['content-color']: '#e2e2e2',
      ['content-color-dark']: '#888',
      ['content-bg-color']: '#1b1c21',
      ['nav-color']: '#161616',
      ['separator-color']: '#404040',
      ['highlight-color']: '#19A0FB',
      ['font-content']: `"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`
    },
  },
]
