<!--
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
-->
<script lang='ts'>
  import BrowseSpace from './BrowseSpace.svelte'
  import CreateSpace from './CreateSpace.svelte'
  import SimplePopup from '@anticrm/presentation/src/components/SimplePopup.svelte'
  import { getUIService } from '../../../utils'

  const uiService = getUIService()

  let actions = [{
    name: 'Create',
    action: () => {
      uiService.showModal(CreateSpace, {})
    }
  }, {
    name: 'Browse',
    action: () => {
      uiService.showModal(BrowseSpace, {})
    }
  }]
</script>

<SimplePopup items={actions}></SimplePopup>
