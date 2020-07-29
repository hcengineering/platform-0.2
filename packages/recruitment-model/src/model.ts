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

import { UIBuilder } from '@anticrm/presentation-model'
import workbench from '@anticrm/workbench-model'
import { Class, Property, Ref, StringProperty } from '@anticrm/platform'
import core from '@anticrm/platform-model'
import contact from '@anticrm/contact-model'
import presentation from '@anticrm/presentation-core'
import presentationUI from '@anticrm/presentation-ui'

import recruitment, { RecruitmentDomain } from '.'
import { IntlString } from '@anticrm/platform-i18n'
import { Candidate } from '@anticrm/recruitment/src'

export default (S: UIBuilder) => {

  S.createDocument(workbench.class.Application, {
    label: 'Найм' as StringProperty,
    icon: recruitment.icon.Recruitment,
    main: presentationUI.component.BrowseView,
    appClass: recruitment.class.Candidate
  }, recruitment.application.Recruitment)

  S.createClassUI(recruitment.class.Candidate, contact.class.Person, {
    _domain: RecruitmentDomain.Recruitment as Property<string, string>,
    label: 'Кандидат' as IntlString
  }, {
    currentPosition: S.attrUI(core.class.Type, {}, {
      label: 'Текущая должность' as IntlString,
      icon: recruitment.icon.Position
    }),
    currentEmployer: S.attrUI(core.class.Type, {}, {
      label: 'Место работы' as IntlString,
      icon: recruitment.icon.Employer
    })
  })

  S.mixin(recruitment.class.Candidate as Ref<Class<Candidate>>, presentation.class.DetailsForm, {
    form: recruitment.component.View2
  })

  S.createDocument(workbench.class.WorkbenchCreateItem, {
    label: 'Найм / Новый Кадидат' as StringProperty,
    icon: recruitment.icon.Recruitment,
    itemClass: recruitment.class.Candidate
  })
}
