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
import { defineComponent, ref } from 'vue'
import core, { Ref, Class, Obj, Doc, CoreService, Instance } from '@anticrm/platform-core'
import { UIDecorator } from '@anticrm/platform-ui'
import { getSession, getUIService } from '@anticrm/platform-vue'
import workbench, { DocCreateAction } from '..'

import LinkTo from '@anticrm/platform-vue/src/components/LinkTo.vue'
import Label from '@anticrm/platform-vue/src/components/Label.vue'
import Icon from '@anticrm/platform-vue/src/components/Icon.vue'

export default defineComponent({
  components: { LinkTo, Label, Icon },
  setup () {
    const actions = ref([] as Instance<DocCreateAction>[])

    const session = getSession()

    // session.find(workbench.class.DocCreateAction, {})
    //   .then(acts => { actions.value = acts })

    const uiService = getUIService()

    async function label (_class: Ref<Class<Obj>>): Promise<string> {
      return uiService.getClassModel(await session.getInstance(_class)).then(model => model.label)
    }

    async function icon (_class: Ref<Class<Obj>>): Promise<string> {
      return uiService.getClassModel(await session.getInstance(_class)).then(model => model.icon)
    }

    return { actions, label, icon }
  }
})
</script>

<template>
  <div class="workbench-new-item-menu">
    <Icon icon="icon:workbench.NewItem" class="icon-embed-2x" />
    <div class="menu">
      <div v-for="action in actions" :key="action._id" class="item">
        <LinkTo :path="action.clazz">
          <Icon :icon="icon(action.clazz)" />
          <br />
          <Label class="caption-6" :text="label(action.clazz)" />
        </LinkTo>
        <!-- {{action.clazz}}</LinkTo> -->
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.workbench-new-item-menu {
  &:hover {
    .menu {
      visibility: visible;
    }
  }

  .menu {
    display: flex;
    position: absolute;
    background-color: $nav-bg-color;
    border: 1px solid $content-color;
    visibility: hidden;

    .item {
      padding: 0.5em;
      text-align: center;

      .icon {
        width: 2em;
        height: 2em;
      }
    }
  }
}
</style>