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
  import { AttrModel, ClassModel, getPresentationService } from '../..'
  import AttributeEditor from '../AttributeEditor.svelte'
  import ui from '@anticrm/platform-ui/'

  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import { Class, Doc, Obj, Ref, RefTo } from '@anticrm/core'
  import { CORE_CLASS_VDOC } from '@anticrm/domains'

  export let _class: Ref<Class<Obj>>

  export let model: ClassModel
  export let object: any
  let stack = [] as ClassModel[]
  let _top: Ref<Class<Obj>>

  // Don't know why direct function call doesn't work and throw exception
  $: {
    if (_class) {
      getPresentationService()
        .then((service) => service.getClassModel(_class, _top))
        .then((m) => toModel(m))
    }
  }

  function toModel (_model: ClassModel) {
    stack = [...stack, model]
    model = _model
  }

  function back () {
    _class = undefined
    model = stack.pop() || model
    stack = stack
  }

  function toAttribute (attr: AttrModel) {
    _top = CORE_CLASS_VDOC
    const ref = attr.type as RefTo<Doc>
    if (ref) {
      _class = ref.to
    }
  }

  function toMixin (_mixin: Ref<Class<Obj>>, top: Ref<Class<Obj>>) {
    _top = top
    _class = _mixin
  }
</script>

<div class="attributes">
  {#if stack.length}
    <div on:click={() => back()}>
      <Icon icon={ui.icon.ArrowDown} button={true} />
    </div>
  {/if}
  {#each model.getGroups() as group (group._class)}
    <div class="group">
      <div class="caption-4">{group.label}</div>
      <table>
        {#each model.getOwnAttributes(group._class) as attr (attr.key)}
          <tr>
            <td class="cell-icon">
              {#if attr.icon}
                <Icon icon={attr.icon} size="24" />
              {/if}
            </td>
            <td width="120px">
              <div class="label">{attr.label}</div>
            </td>
            <td>
              <div class="edit">
                {#if attr.presenter === 'component:presentation.RefPresenter'}
                  <div on:click={() => toAttribute(attr)}>
                    <Icon icon={ui.icon.More} button={true} />
                  </div>
                {:else}
                  <AttributeEditor attribute={attr} bind:value={object[attr.key]} />
                {/if}
              </div>
            </td>
          </tr>
        {/each}
        {#if !stack.length}
          {#each model.getMixins(group._class) as _mixin (_mixin)}
            <tr>
              <td class="cell-icon">
                {#if _mixin.icon}
                  <Icon icon={_mixin.icon} size="24" />
                {/if}
              </td>
              <td width="120px">
                <div class="caption-4">{_mixin.label}</div>
              </td>
              <td>
                <div class="edit" on:click={() => toMixin(_mixin._mixin, _mixin._class)}>
                  <Icon icon={ui.icon.More} button={true} />
                </div>
              </td>
            </tr>
          {/each}
        {/if}
      </table>
    </div>
  {/each}
</div>

<style lang="scss">
  .attributes {
    display: flex;
    flex-wrap: wrap;

    margin-top: 1em;

    .group {
      padding: 0.2em;
    }
  }

  .label,
  .cell-icon {
    color: var(--theme-content-dark-color);
  }

  .edit {
    font-family: Raleway;
    font-size: 14px;
  }
</style>
