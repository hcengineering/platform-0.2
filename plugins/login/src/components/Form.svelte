<script lang="ts">
  import { Status, Severity } from "@anticrm/platform";

  interface Field {
    name: string;
    i18n: string;
    password?: boolean;
    optional?: boolean;
  }

  interface Action {
    i18n: string;
    func: () => Promise<void>;
  }

  export let caption: string;
  export let status = new Status(Severity.OK, 0, "");
  export let fields: Field[];
  export let actions: Action[];
  export let object: any;

  $: description = status.message;

  function validate() {
    for (const field of fields) {
      const v = object[field.name];
      const f = field;
      if (!f.optional && (!v || v === "")) {
        status = new Status(
          Severity.INFO,
          0,
          `Поле '${field.i18n}' обязательно к заполнению.`
        );
        return;
      }
    }
    status = new Status(Severity.OK, 0, "");
  }
</script>

<style lang="scss">
  form {
    margin: auto;
    margin-top: 20vh;
    width: 30em;
    padding: 2em;
    border: 1px solid var(--theme-separator-color);
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

<form>
  <div class="caption-2">{caption}</div>
  <div class="status">{description}</div>

  {#each fields as field (field.name)}
    <div class="field">
      {#if field.password}
        <input
          class="editbox"
          name={field.name}
          placeholder={field.i18n}
          type="password"
          bind:value={object[field.name]}
          on:keyup={validate} />
      {:else}
        <input
          class="editbox"
          name={field.name}
          placeholder={field.i18n}
          type="text"
          bind:value={object[field.name]}
          on:keyup={validate} />
      {/if}
    </div>
  {/each}

  <div class="actions">
    {#each actions as action, i}
      <button
        class="button"
        class:separator={i != 0}
        on:click|preventDefault={action.func}>
        {action.i18n}
      </button>
    {/each}
  </div>
</form>
