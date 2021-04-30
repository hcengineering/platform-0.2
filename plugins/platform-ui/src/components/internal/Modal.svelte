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
  import { store as modal } from '../../stores'

  function close () {
    modal.set({ is: undefined, props: {}, element: undefined })
  }

  function handleKeydown (ev: KeyboardEvent) {
    if (ev.key === 'Escape' && $modal.is) {
      close()
    }
  }

  function getStyle (element: HTMLElement | undefined) {
    if (element) {
      const rect = element.getBoundingClientRect()
      return `top: ${rect.top + rect.height + 2}px; left: ${rect.left}px;`
    } else {
      return 'top: 50%; left: 50%; transform: translate(-50%, -50%);'
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if $modal.is}
  <div class="modal" class:top-arrow={$modal.element} style={getStyle($modal.element)}>
    <svelte:component this={$modal.is} {...$modal.props} on:close={close} />
  </div>
  <div class="modal-overlay" />
{/if}

<style lang="scss">
  .modal {
    position: fixed;
    z-index: 1001;
    border: solid 1px transparent;
    border-radius: 4px;
    padding: 0px;
    background-color: var(--theme-bg-color);
    border-color: var(--theme-bg-accent-color);
    box-shadow: var(--theme-shadow);
  }

  .modal-overlay {
    z-index: 1000;
    background: rgba(0, 0, 0, 0.25);
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(3px);
  }
</style>
