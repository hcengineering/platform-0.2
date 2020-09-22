<script lang="ts">
  import { Platform, Severity, Status } from "@anticrm/platform";
  import { getContext } from "svelte";
  import login from "..";

  import Form from "./Form.svelte";

  let object = { username: "", password: "", workspace: "" };
  let status: Status;

  const platform = getContext("platform") as Platform;

  async function doLogin() {
    status = new Status(Severity.INFO, 0, "Соединяюсь с сервером...");

    const loginService = await platform.getPlugin(login.id);
    status = await loginService.doLogin(
      object.username,
      object.password,
      object.workspace
    );
  }

  async function doSignup() {}
</script>

<Form
  actions={[{ i18n: 'Создать пространство', func: doSignup }, { i18n: 'Войти в систему', func: doLogin }]}
  fields={[{ name: 'username', i18n: 'Электропочта' }, { name: 'password', i18n: 'Пароль', password: true }, { name: 'workspace', i18n: 'Рабочее пространство' }]}
  {object}
  caption="Вход в систему"
  {status} />
