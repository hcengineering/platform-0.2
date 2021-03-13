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
<script lang="ts">
  import { Class, Type, ArrayOf, InstanceOf, CORE_CLASS_DOC } from '@anticrm/core'
  import { AttrModel } from '../../../../index'
  import { getPresentationService, getEmptyModel, _getCoreService } from '../../../../utils'
  import Presenter from '../Presenter.svelte'

  export let value: any
  export let attribute: AttrModel

  let itemAttributes: AttrModel[] = []

  $: arrayValues = value
  const arrayOf = attribute.type as ArrayOf
  if (arrayOf) {
    const instanceOf = arrayOf.of as InstanceOf<Type>;
    const itemClass = instanceOf?.of;
    if (itemClass) {
       getPresentationService()
              .then((p) => p.getClassModel(itemClass, CORE_CLASS_DOC))
              .then((model) => {
                itemAttributes = model.getAttributes()
              })
    }
  }
</script>

<style lang="scss">
  .array-container {
    display: flex;
    flex-direction: column;
  }

  .attributes-container {
    display: flex;
  }

</style>

<div class="array-container">
  {#if arrayValues && itemAttributes}
    {#each arrayValues as item (item.message)}
      <div class="attributes-container">
        {#each itemAttributes as attr (attr.key)}
          {#if attr.presenter}
            <Presenter is={attr.presenter} value={item[attr.key] || '' } attribute={attr} />
          {:else}
            <span>{item[attr.key] || ''}</span>
          {/if}
        {/each}
      </div>
    {/each}
  {/if}
</div>
