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
  import { WithResume } from '..'

  export let resume: WithResume['resume']
</script>

{#if resume.skills.length > 0}
  <div>
    Skills: {resume.skills.map((x) => `${x.skill} (${x.level})`).join(', ')}
  </div>
{/if}
{#if resume.profInterests.length > 0}
  <div>
    Professional interests: {resume.profInterests.join(', ')}
  </div>
{/if}
{#if resume.hobbies.length > 0}
  <div>
    Hobbies: {resume.hobbies.join(', ')}
  </div>
{/if}
