<script lang="ts">
  import { Platform, Severity, Status } from '@anticrm/platform'
  import { getContext } from 'svelte'
  import login from '..'

  import CheckBox from '@anticrm/sparkling-controls/src/CheckBox.svelte'
  const twofactor = require("node-2fa");

  let object = { oldPassword: '', newPassword: '', newPasswordConfirm: '', clientSecret: '', secondFactorCode: '' }
  let changePassword = false;
  let status = new Status(Severity.OK, 0, '')
  
  const platform = getContext('platform') as Platform
  const loginService = platform.getPlugin(login.id)
  
  let secondFactorInitEnabled = false;
  let secondFactorEnabled = false;
  $: secondFactorCurrentEnabled = secondFactorEnabled && !secondFactorInitEnabled;
  $: newSecret = secondFactorCurrentEnabled && twofactor.generateSecret({name: "Anticrm"});
  $: src = newSecret.qr;
  $: object.clientSecret = newSecret.secret;

  const secondFactorCheck = loginService.then(ls => {
    ls.getLoginInfo().then(li => {
      secondFactorInitEnabled = li?.secondFactorEnabled ? true : false;
      secondFactorEnabled = secondFactorInitEnabled;
    });
  })

  async function cancelSaveSetting(): Promise<void> {
    (await loginService).navigateLoginForm()
  }
  
  $: description = status.message

  async function saveSetting (): Promise<void> {
    if (!object.oldPassword) {
      status = new Status(Severity.INFO, 0, `Поле пароль обязательно к заполнению.`);
      return;
    }
    
    if (object.newPassword != object.newPasswordConfirm) {
      status = new Status(Severity.INFO, 0, `Пароль и подтверждения пароля не совпадают`);
      return;
    }
    
    if (object.clientSecret && !object.secondFactorCode){
      status = new Status(Severity.INFO, 0, `Поле код подтверждения обязательно для заполнения`);
      return;
    }
    
    if (!object.clientSecret && object.secondFactorCode){
      status = new Status(Severity.INFO, 0, `Поле секретный код обязательно для заполнения`);
      return;
    }
    
    status = new Status(Severity.INFO, 0, 'Соединяюсь с сервером...');

    status = await (await loginService).saveSetting(object.oldPassword, object.newPassword, secondFactorEnabled, object.clientSecret, object.secondFactorCode);
  }
</script>

<form class="form">
  <div class="status">{description}</div>
  <div class="field">
    <input
          class="editbox"
          name="oldPassword"
          placeholder="Пароль"
          type="password"
          bind:value={object.oldPassword} />
  </div>
  <div class="field">
    <CheckBox bind:checked={changePassword}>
      Изменить пароль
    </CheckBox>
  </div>
  {#if changePassword}
  <div class="field">
    <input
          class="editbox"
          name="newPassword"
          placeholder="Новый пароль"
          type="password"
          bind:value={object.newPassword} />
  </div>
  <div class="field">
    <input
          class="editbox"
          name="newPasswordConfirm"
          placeholder="Подтверждение пароля"
          type="password"
          bind:value={object.newPasswordConfirm}/>
  </div>
  {/if}
  {#await secondFactorCheck then value}
    <div class="field">
      <CheckBox bind:checked={secondFactorEnabled}>
        Включить двухфакторную авторизацию
      </CheckBox>
    </div>
    {#if secondFactorCurrentEnabled}
      <div class="field">
        <input
              class="editbox"
              name="clientSecret"
              placeholder="Секретный код"
              type="text"
              bind:value={object.clientSecret}/>
      </div>
      {#if src}
        <div>
          <img {src} alt="qr code">
        </div>
      {/if}
      <div class="field">
        <input
              class="editbox"
              name="secondFactorCode"
              placeholder="Код подтверждения"
              type="text"
              bind:value={object.secondFactorCode}/>
      </div>
    {/if}
  {/await}
  <div class="buttons">
    <button class="button" on:click|preventDefault={cancelSaveSetting}> Отменить </button>
    <button class="button" on:click|preventDefault={saveSetting}> Сохранить </button>
  </div>
</form>

<style lang="scss">
  img {
    display: block;
    margin-left: auto;
    margin-right: auto;
    width: 50%;
  }
  
  form {
    margin: auto;
    margin-top: 3vh;
    width: 30em;
    padding: 1em;
    border: 1px solid var(--theme-bg-accent-color);
    border-radius: 1em;

    .status {
      margin-top: 0.5em;
    }

    .field {
      .editbox {
        width: 100%;
      }

      margin: 1em 0;
    }

    .actions {
      display: flex;
      margin-top: 1.5em;

      .button {
        flex: 1;

        &.separator {
          margin-left: 1em;
        }
      }
    }
  }
</style>
