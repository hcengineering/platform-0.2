<!--
// Copyright © 2020, 2021 Anticrm Platform Contributors.
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
  import { Status, Severity } from '@anticrm/status'
  import { Status as StatusControl, EditBox, Button } from '@anticrm/sparkling-controls'

  interface Field {
    name: string
    i18n: string
    password?: boolean
    optional?: boolean
    short?: boolean
  }

  interface Action {
    i18n: string
    func: () => Promise<void>
  }

  export let caption: string
  export let fields: Field[]
  export let action: Action
  export let object: any

  let status = new Status(Severity.OK, 0, '')

  function validate () {
    for (const field of fields) {
      const v = object[field.name]
      const f = field
      if (!f.optional && (!v || v === '')) {
        status = new Status(Severity.INFO, 0, `Поле '${field.i18n}' обязательно к заполнению.`)
        return
      }
    }
    status = new Status(Severity.OK, 0, '')
  }
  validate()

  let inAction = false

  function performAction(action: Action) {
    inAction = true
    action.func().finally(() => {inAction = false})
  }

</script>

<form class="form-container">
  <div class="grow-separator"/>
  <div class="title">{caption}</div>
  <div class="status">
    <StatusControl {status} width="100%"/>
  </div>
  <div class="form">

    {#each fields as field (field.name)}
    <div class={field.short ? 'form-col' : 'form-row'}>
      <EditBox label={field.i18n} password={field.password} bind:value={object[field.name]} on:keyup={validate}/>
    </div>
    {/each}

    <div class="form-row send">
      <Button label={action.i18n} primary width="100%" loading={inAction} disabled={status.severity !== Severity.OK} on:click={() => {performAction(action)}}/>
    </div>

    <!-- <div class="form-col"><EditBox label="First Name" bind:value={fname}/></div>
    <div class="form-col"><EditBox label="Last Name" bind:value={lname}/></div>
    <div class="form-row"><EditBox label="E-mail"/></div>
    <div class="form-row"><EditBox label="Password" password/></div>
    <div class="form-row"><EditBox label="Repeat password" password/></div> -->

  </div>
  <div class="grow-separator"/>
  <div class="footer"><span>Do not have an account?</span> <a href="/login">Sign Up</a></div>
</form>

  <!-- <div class="actions">
    {#each actions as action, i}
      <button class="button" class:separator={i !== 0} on:click|preventDefault={action.func}> {action.i18n} </button>
    {/each}
  </div> -->

<style lang="scss">

  .form-container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    height: 100%;
    padding: 80px 80px;

    .title {
      font-weight: 600;
      font-size: 24px;
      line-height: 29px;
      color: #FFFFFF;
    }
    .status {
      min-height: 120px;
      max-height: 120px;
      padding-top: 20px;
    }
    
    .form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: 12px;
      row-gap: 24px;

      .form-row {
        grid-column-start: 1;
        grid-column-end: 3;
      }
      @media (max-width: 985px) {
        .form-col {
          grid-column-start: 1;
          grid-column-end: 3;
        }
      }
      .send {
        margin-top: 36px;
      }
    }
    .grow-separator {
      flex-grow: 1;
    }
    .footer {
      margin-top: 56px;
      font-size: 13px;
      line-height: 16px;
      color: #FFFFFF;
      span {
        opacity: 0.3;
      }
      a {
        color: #fff;
        opacity: 0.8;
        text-decoration: none;
        :hover {
          opacity: 1;
        }
      }
    }
  }

</style>
