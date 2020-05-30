<!--
  -
  - Copyright © 2020 Anticrm Platform Contributors.
  -
  - Licensed under the Eclipse Public License, Version 2.0 (the "License");
  - you may not use this file except in compliance with the License. You may
  - obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
  -
  - Unless required by applicable law or agreed to in writing, software
  - distributed under the License is distributed on an "AS IS" BASIS,
  - WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  -
  - See the License for the specific language governing permissions and
  - limitations under the License.
  -
  -->

<script lang="ts">
import { defineComponent, inject } from 'vue'
import ui, { AnyComponent, UIState } from '@anticrm/platform-ui'
import mc from '..'

import Button from '@anticrm/sparkling-controls/src/Button.vue'
import PluginList from './Plugins.vue'
import Credits from './Credits.vue'

export default defineComponent({
  components: { PluginList, Credits, Button },
  props: {
    app: String
  },
  setup () {
    return {
      pluginInfos () {
        return this.$platform.getPluginInfos()
      },
      applications (): AnyComponent[] {
        console.log('applications:')
        return this.$platform.getMetadata(mc.metadata.Applications)
      },
      run (app) {
        this.$emit('pushState', '/' + app)
      }
    }
  }
})
</script>

<template>
  <div class="info">
    <div class="logo">
      <span class="text-1">anticrm</span>
      <span class="text-2">Platform</span>&nbsp;
      <span class="text-3">0.1.0</span>
    </div>

    <div class="caption" style="grid-area: pluginsLabel">Available plugins</div>
    <PluginList class="content" style="grid-area: plugins" :plugins="pluginInfos()" />

    <div class="caption" style="grid-area: creditsLabel">Credits</div>
    <Credits class="content" style="grid-area: credits" />

    <div class="caption" style="grid-area: appLabel">Applications</div>
    <div class="content" style="grid-area: app">
      <div v-for="app in applications()" :key="app">
        <Button style="width:100%; margin-top: 0.5em" @click="run(app)">
          <span style="text-transform: uppercase">{{app}}</span>
        </Button>
      </div>
    </div>

    <div class="copy">
      &copy; 2020
      <a href="https://github.com/anticrm/platform">Anticrm Platform</a> Contributors.
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

// $f: "Montserrat";
//  $f: "Open Sans";
//  $f: "Manrope";
//  $f: "IBM Plex Sans";
$f: "IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto;
//$f: -apple-system,system-ui,BlinkMacSystemFont;

//  $f: "Inter";

.info {
  font-family: $f;

  font-size: 10px;
  text-transform: uppercase;

  display: grid;
  grid-template-columns: 200px 250px 200px 250px;
  grid-template-rows: 4em auto 2em auto 4em;
  grid-template-areas:
    "logo . . ."
    "pluginsLabel plugins creditsLabel credits"
    ". . . ."
    "appLabel app . ."
    "copy copy copy copy";

  padding: 2em;

  .logo {
    padding-right: 1em;
    text-align: right;
    grid-area: logo;
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

  .caption {
    border-right: $content-color solid 1px;
    padding: 1px 1em 1px 1px;
    text-align: right;
    font-weight: 700;
  }

  .content {
    width: 100%;
    padding-left: 1em;
  }

  .copy {
    grid-area: copy;
    align-self: end;
  }
}
</style>
