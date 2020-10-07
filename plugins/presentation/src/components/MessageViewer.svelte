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
    MessageParagraph,
    MessageText,
    MessageDocument,
    MessageMark,
    StrongMark,
    ItalicMark,
    UnderlineMark,
    MessageOrderedList,
    MessageListItem,
    MessageBulletList,
    StrikeMark,
    ReferenceMark,
MessageHardBreak
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
      if (mark instanceof StrongMark) {
        result.bold = true
      }
      if (mark instanceof ItalicMark) {
        result.italic = true
      }
      if (mark instanceof UnderlineMark) {
        result.underline = true
      }
      if (mark instanceof StrikeMark) {
        result.strike = true
      }
      if (mark instanceof ReferenceMark) {
        let rm: ReferenceMark = mark
        result.reference.state = true
        result.reference._id = rm.attrs.id || ''
        result.reference._class = rm.attrs.class
        result.reference.resolved = result.reference._id != ''
      }
    }
    return result
  }
</script>

{#if message instanceof MessageParagraph}
  <p>
    {#each message.childs() as c}
      <svelte:self message="{c}" />
    {/each}
  </p>
{:else if message instanceof MessageText}
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
{:else if message instanceof MessageListItem}
  <li>
    {#each message.childs() as c}
      <svelte:self message="{c}" />
    {/each}
  </li>
{:else if message instanceof MessageDocument}
  {#each message.childs() as c}
    <svelte:self message="{c}" />
  {/each}
  <!---->
{:else if message instanceof MessageOrderedList}
  <ol type="1">
    {#each message.childs() as c}
      <svelte:self message="{c}" />
    {/each}
  </ol>
  <!---->
{:else if message instanceof MessageHardBreak}
  <br/>
  <!---->
{:else if message instanceof MessageBulletList}
  <ul>
    {#each message.childs() as c}
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
