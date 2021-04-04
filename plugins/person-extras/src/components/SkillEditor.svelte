<!--
Copyright © 2020, 2021 Anticrm Platform Contributors.

Licensed under the Eclipse Public License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may
obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

See the License for the specific language governing permissions and
limitations under the License.
-->
<script lang="ts">
  import EditBox from '@anticrm/sparkling-controls/src/EditBox.svelte'

  import type { Skill } from '..'

  export let skill: Skill
</script>

<div class="root">
  <EditBox bind:value={skill.skill} label="Skill" placeholder="Skill" />
  <EditBox bind:value={skill.level} label="Level" placeholder="Level" />
</div>

<style lang="scss">
  .root {
    display: grid;
    grid-template-columns: 3fr 1fr;
    grid-gap: 5px;
  }
</style>
