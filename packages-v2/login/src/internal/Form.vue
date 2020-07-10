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

import { defineComponent, ref, watch, PropType } from 'vue'
import EditBox from '@anticrm/sparkling-controls/src/EditBox.vue'
import Button from '@anticrm/sparkling-controls/src/Button.vue'

interface Fields {
  [key: string]: {
    type?: string
    optional?: boolean
    i18n: string
  }
}

interface Action {
  i18n: string,
  func: () => Promise<void>
}

export default defineComponent({
  components: { EditBox, Button },
  props: {
    caption: String,
    description: String,
    info: String,
    error: String,
    object: Object,
    fields: Object as PropType<Fields>,
    actions: Array as PropType<Action[]>
  },
  setup (props) {
    const status = ref(props.description)

    watch(() => props.info, (info) => {
      status.value = info
    })
    watch(() => props.error, (error) => {
      status.value = error
    })

    function validate () {
      for (const field in props.fields) {
        const v = props.object[field]
        const f = props.fields[field]
        if (!f.optional && (!v || v === '')) {
          status.value = `Поле '${props.fields[field].i18n}' обязательно к заполнению.`
          return
        }
      }
      status.value = props.description
    }

    validate()

    return { status, validate }
  }
})
</script>

<template>
  <div class="login-chrome">
    <form @status="onStatus" @error="console.log('$event')">
      <div class="caption-2">{{ caption }}</div>
      <div class="status">{{ status }}</div>

      <div v-for="(field, name) in fields" :key="name" class="field">
        <EditBox
          @keyup="validate"
          :name="name"
          :type="field.type || 'text'"
          :placeholder="field.i18n"
          v-model="object[name]"
        />
      </div>

      <div class="actions">
        <Button
          @click="action.func.bind(this)()"
          v-for="(action, i) in actions"
          :key="i"
          :class="{ 'separator': i != 0 }"
        >{{action.i18n}}</Button>
        <!-- <div class="separator" />
        <Button @click="doLogin">Войти в систему</Button>-->
      </div>
    </form>
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.login-chrome {
  form {
    margin: auto;
    margin-top: 20vh;
    width: 30em;
    padding: 2em;
    border: 1px solid $workspace-separator-color;
    border-radius: 1em;

    .status {
      margin-top: 0.5em;
    }

    .field {
      .sparkling-edit-box {
        width: 100%;
      }
      margin: 1em 0;
    }

    .actions {
      display: flex;
      margin-top: 1.5em;

      .sparkling-button {
        flex: 1;
        &.separator {
          margin-left: 1em;
        }
      }
    }
  }
}
</style>
