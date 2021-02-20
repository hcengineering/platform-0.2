<script lang="ts">
  import { Platform, Severity, Status } from '@anticrm/platform'
  import { getContext } from 'svelte'
  import login from '..'

  import Form from './Form.svelte'

  let object = { username: '', password: '', workspace: '' }
  let status: Status

  const platform = getContext('platform') as Platform
  const loginService = platform.getPlugin(login.id)

  async function doLogin () {
    status = new Status(Severity.INFO, 0, 'Соединяюсь с сервером...')

    status = await (await loginService).doLogin(object.username, object.password, object.workspace)
  }

  async function doSignup () {
  }

  // Auto forward to default application
  loginService.then((ls) => ls.checkLoginForward())
</script>

<Form
  actions={[{ i18n: 'Создать пространство', func: doSignup }, { i18n: 'Войти в систему', func: doLogin }]}
  fields={[{ name: 'username', i18n: 'Электропочта' }, { name: 'password', i18n: 'Пароль', password: true }, { name: 'workspace', i18n: 'Рабочее пространство' }]}
  {object}
  caption="Вход в систему"
  {status} />
