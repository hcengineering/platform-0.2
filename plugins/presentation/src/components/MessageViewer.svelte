<script lang="ts">
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

  import {
    MessageNode,
    MessageMark,
    ReferenceMark,
    MessageMarkType,
    MessageNodeType,
    messageContent
  } from '@anticrm/core'

  export let message: MessageNode

  class Style {
    bold: boolean = false
    italic: boolean = false
    underline: boolean = false
    strike: boolean = false

    reference: {
      state: boolean
      _id: string
      _class: string
      resolved: boolean
    } = {
      state: false,
      resolved: false,
      _id: '',
      _class: ''
    }
  }

  $: style = computedStyle(message.marks || [])

  function computedStyle(marks: MessageMark[]): Style {
    let result = new Style()
    for (let mark of marks) {
      switch (mark.type) {
        case MessageMarkType.strong:
          result.bold = true
          break
        case MessageMarkType.em:
          result.italic = true
          break
        case MessageMarkType.underline:
          result.underline = true
          break
        case MessageMarkType.strike:
          result.strike = true
          break
        case MessageMarkType.reference:
          let rm: ReferenceMark = mark as ReferenceMark
          result.reference.state = true
          result.reference._id = rm.attrs.id || ''
          result.reference._class = rm.attrs.class
          result.reference.resolved = result.reference._id != ''
          break
      }
    }
    return result
  }
</script>

{#if message.type === MessageNodeType.paragraph}
  <p>
    {#each messageContent(message) as c}
      <svelte:self message="{c}" />
    {/each}
  </p>
{:else if message.type === MessageNodeType.text}
  <span
    class="inline-block"
    class:bold="{style.bold}"
    class:italic="{style.italic}"
    class:underline="{style.underline}"
    class:strike="{style.strike}"
    class:resolved_reference="{style.reference.resolved}"
    class:unknown_reference="{style.reference.state && !style.reference.resolved}"
  >
    {#if style.reference.state}
      <!-- TODO: Add a proper click handler here-->
      <a
        href="{'#click-me:' + style.reference._class + '/' + style.reference._id}"
      >
        {message.text || ''}
      </a>
    {:else}{message.text || ''}{/if}
  </span>
{:else if message.type === MessageNodeType.list_item}
  <li>
    {#each messageContent(message) as c}
      <svelte:self message="{c}" />
    {/each}
  </li>
{:else if message.type === MessageNodeType.doc}
  {#each messageContent(message) as c}
    <svelte:self message="{c}" />
  {/each}
  <!---->
{:else if message.type === MessageNodeType.ordered_list}
  <ol type="1">
    {#each messageContent(message) as c}
      <svelte:self message="{c}" />
    {/each}
  </ol>
  <!---->
{:else if message.type === MessageNodeType.hard_break}
  <br />
  <!---->
{:else if message.type === MessageNodeType.bullet_list}
  <ul>
    {#each messageContent(message) as c}
      <svelte:self message="{c}" />
    {/each}
  </ul>
  <!---->
{/if}

<style lang="scss">
  .inline-block {
    display: inline-block;
    white-space: pre;
  }
  .bold {
    font-weight: bold;
  }
  .italic {
    font-style: italic;
  }
  .underline {
    text-decoration: underline;
  }
  .resolved_reference {
    color: lightblue;
  }
  .unknown_reference {
    color: grey;
  }
</style>
