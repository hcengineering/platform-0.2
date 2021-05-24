// Copyright © 2020, 2021 Anticrm Platform Contributors.
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

import { Builder } from '@anticrm/model'
import { IntlString } from '@anticrm/platform-i18n'
import workbench from '@anticrm/workbench/src/__model__'

import meeting from '.'

export function model (S: Builder): void {
  S.createDocument(workbench.class.WorkbenchApplication, {
    route: 'meeting',
    label: 'Meeting' as IntlString,
    icon: meeting.icon.Meeting,
    component: meeting.component.MeetingView,
    classes: [],
    spaceTitle: 'Meeting room',
    supportSpaces: true
  }, meeting.application.Meeting)
}
