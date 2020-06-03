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
import { defineComponent, inject } from 'vue'
import { PluginInfo, PluginStatus } from '@anticrm/platform'
import ui, { AnyComponent } from '@anticrm/platform-ui'
import mc from '..'

import Button from '@anticrm/sparkling-controls/src/Button.vue'
import InfoPanel from '@anticrm/sparkling-controls/src/InfoPanel.vue'

import Link from '@anticrm/platform-ui-components/src/components/Link.vue'

export default defineComponent({
  components: { Button, InfoPanel, Link },
  props: {
    app: String
  },
  setup () {
    return {
      pluginInfos () {
        return this.$platform.getPluginInfos()
      },
      applications (): AnyComponent[] {
        return this.$platform.getMetadata(mc.metadata.Applications)
      },
      run (app) {
        console.log('run: ' + app)
        this.$emit('pushState', { app, path: '' })
      },
      status (info: PluginInfo) {
        return (info.status === PluginStatus.RUNNING) ? '☀︎' : ''
      },
      credits: [
        ["Andrey Platov", "Project Sponsor"],
        ["", "Project Manager"],
        ["", "Product Owner"],
        ["", "Product Manager"],
        ["", "Senior Frontend Engineer"],
        ["", "Senior Backend Engineer"],
        ["", "Senior DevOps"],
        ["", "System Architect"],
        ["", "Release Manager"],
        ["", "UI/UX Lead"],
        ["", "QA Lead"],
      ]
    }
  }
})
</script>

<template>
  <div class="text-small-uppercase info">
    <header class="logo">
      <span class="text-1">anticrm</span>
      <span class="text-2">Platform</span>&nbsp;
      <span class="text-3">0.1.0</span>
    </header>

    <main>
      <InfoPanel caption="Available plugins">
        <div class="crm-table">
          <div class="tr" v-for="config in pluginInfos()" :key="config.id">
            <div class="td mc-plugins">platform-{{config.id}}</div>
            <div class="td mc-plugins">{{config.version}}</div>
            <div class="td mc-plugins">{{status(config)}}</div>
          </div>
        </div>
      </InfoPanel>

      <InfoPanel caption="Credits">
        <div class="crm-table">
          <div class="tr" v-for="(credit, index) in credits" :key="index">
            <div class="td mc-plugins" style="white-space:nowrap">{{credit[0]}}</div>
            <div class="td mc-plugins">{{credit[1]}}</div>
          </div>
        </div>
      </InfoPanel>

      <InfoPanel caption="Applications">
        <div v-for="app in applications()" :key="app">
          <Link :app="app">{{app}}</Link>
        </div>
      </InfoPanel>
    </main>

    <footer class="copy">
      &copy; 2020
      <a href="https://github.com/anticrm/platform">Anticrm Platform</a> Contributors.
    </footer>
  </div>
</template>

          <!-- <Button style="width:100%; margin-top: 0.5em" @click="run(app)">
            <span style="text-transform: uppercase">{{app}}</span>
          </Button>-->

<style scoped lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.crm-table {
  .mc-plugins {
    padding-right: 0.5em;
    padding-bottom: 0.25em;
  }
}

.info {
  display: flex;
  flex-direction: column;

  main {
    display: flex;
    flex-wrap: wrap;
  }

  .logo {
    padding: 1em 2em;
    text-transform: initial;

    .text-1 {
      font-size: 1.5em;
      font-weight: 400;
    }
    .text-2 {
      font-size: 2em;
      font-weight: 700;
    }
    .text-3 {
      font-size: 1em;
      font-weight: 700;
    }
  }

  .copy {
    padding: 2em;
  }
}
</style>
