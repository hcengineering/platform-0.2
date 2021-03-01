<script lang="ts">
  import { Platform, Severity, Status } from '@anticrm/platform'
  import { getContext, onDestroy } from 'svelte'
  import login, { LoginService } from '..'

  import Form from './Form.svelte'
  import Button from '@anticrm/sparkling-controls/src/Button.svelte'

  let object = { username: '', password: '', workspace: '' }
  let status: Status

  let loginActive: boolean = false

  const platform = getContext('platform') as Platform
  const loginService = platform.getPlugin(login.id)

  async function doLogin () {
    status = new Status(Severity.INFO, 0, 'Соединяюсь с сервером...')

    status = await (await loginService).doLogin(object.username, object.password, object.workspace)
  }

  async function doSignup () {
  }

  async function checkLoginInfo (ls: LoginService) {
    const info = await ls.getLoginInfo()
    console.log('login info:', info)
    if (info) {
      loginActive = true
      object.username = info.email
      object.workspace = info.workspace
    }
  }

  let timer: number
  // Auto forward to default application
  const loginCheck = loginService.then(async (ls) => {
    await checkLoginInfo(ls)

    timer = setInterval(async () => {
      await checkLoginInfo(ls)
    }, 1 * 1000)
  })

  onDestroy(() => {
    if (timer) {
      clearInterval(timer)
    }
  })

  async function logout (): Promise<void> {
    (await loginService).doLogout()
    loginActive = false
  }

  async function navigateApp (): Promise<void> {
    (await loginService).navigateApp()
  }
</script>

{#await loginCheck then value}
  {#if loginActive }
    <div class="login-form-info">
      <div class="field">
        Logged in as: {object.username}
      </div>
      <div class="field">
        Workspace: {object.workspace}
      </div>
      <div class="actions">
        <Button width="100px" on:click={ logout  }>Logout</Button>
        <Button width="100px" on:click={ navigateApp }>Switch to Application</Button>
      </div>
    </div>
  {:else}
    <Form
      actions={[{ i18n: 'Создать пространство', func: doSignup }, { i18n: 'Войти в систему', func: doLogin }]}
      fields={[{ name: 'username', i18n: 'Электропочта' }, { name: 'password', i18n: 'Пароль', password: true }, { name: 'workspace', i18n: 'Рабочее пространство' }]}
      {object}
      caption="Вход в систему"
      {status} />
  {/if}
{/await}

<style lang="scss">
  .login-form-info {
    margin: auto;
    margin-top: 20vh;
    width: 30em;
    padding: 2em;
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
