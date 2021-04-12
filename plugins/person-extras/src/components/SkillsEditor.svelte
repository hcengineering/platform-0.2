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
  import workbench from '@anticrm/workbench/src/__model__'

  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import SkillEditor from './SkillEditor.svelte'
  import type { Skill } from '..'
  import personExtras from '..'

  export let skills: Skill[]

  function addSkill () {
    skills.push({
      __embedded: true,
      _class: personExtras.class.Skill,
      level: 0,
      skill: ''
    })

    skills = skills
  }
</script>

{#if skills.length > 0}
  <div class="root">
    {#each skills as skill}
      <SkillEditor bind:skill />
    {/each}
  </div>
{/if}

<div class="add" on:click={addSkill}>
  <Icon icon={workbench.icon.Add} button={true} />
  <div class="add-label">Add Skill</div>
</div>

<style lang="scss">
  @import '~@anticrm/sparkling-theme/styles/_global.scss';

  .root {
    display: grid;
    grid-template-columns: auto;
    grid-gap: 5px;

    padding: 5px;
    border: 1px solid;
    border-radius: 5px;
  }
  :global(.theme-dark) .root {
    border-color: $theme-dark-bg-accent-color;
  }
  :global(.theme-grey) .root {
    border-color: $theme-grey-bg-accent-color;
  }
  :global(.theme-light) .root {
    border-color: $theme-light-bg-accent-color;
  }

  .add {
    display: flex;
    align-items: center;

    cursor: pointer;
  }

  .add-label {
    padding-left: 5px;
    font-weight: 500;
  }
</style>
