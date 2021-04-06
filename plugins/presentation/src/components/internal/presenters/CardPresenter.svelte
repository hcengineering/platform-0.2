<script type="ts">
  import type { Attribute, Class, Doc, Enum, EnumKey, EnumOf, Property, Ref } from '@anticrm/core'
  import { AttributeMatch, CORE_CLASS_ENUM_OF, Model } from '@anticrm/core'
  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import workbench from '@anticrm/workbench'
  import type { UXAttribute } from '@anticrm/presentation'
  import ui from '@anticrm/presentation'
  import presentationPlugin, { getCoreService, getPresentationService, liveQuery } from '@anticrm/presentation'
  import type { Space, VDoc } from '@anticrm/domains'
  import Card from './Card.svelte'
  import type { AnyComponent } from '@anticrm/platform-ui'
  import type { CardDragEvent } from './cardHelper'

  export let _class: Ref<Class<VDoc>>
  export let space: Space
  export let field = '' // A field name, if not specified first enum will be used.

  const coreService = getCoreService()

  let presenter: AnyComponent

  let dragId: any | null = null
  let dragIn: any | null = null

  let fieldAttr: AttributeMatch

  interface StatUses {
    id: any
    label: string
    color: string
    hidden: boolean
    defValue: boolean
    divTasks: any
  }

  let statuses: Array<StatUses> = []

  getPresentationService().then((ps) => {
    presenter = ps.getComponentExtension(_class, presentationPlugin.mixin.CardForm) || presentationPlugin.component.VDocCardPresenter
  })

  function findAttr (model: Model, _class: Ref<Class<Doc>>, field: string | undefined): AttributeMatch {
    if (field !== '' && field) {
      const attr = model.classAttribute(_class, field)
      if (!attr) {
        throw new Error(`Failed to find a enum attribute ${field} in class ${_class} `)
      }
      if (attr.attr.type._class === CORE_CLASS_ENUM_OF) {
        return attr
      }
    } else {
      // Find a first enum field and use it's as field
      for (const m of model.getAllAttributes(_class)) {
        if (m.attr.type._class === CORE_CLASS_ENUM_OF) {
          return m
        }
      }
    }
  }

  // Load and subscribe to any task status values.
  $: if (_class) {
    coreService.then((cs) => {
      const model = cs.getModel()

      const attr = findAttr(model, _class, field)
      let enumFieldClass: Enum<EnumKey>
      if (attr) {
        enumFieldClass = model.get((attr.attr.type as EnumOf<EnumKey>).of)
        fieldAttr = attr
      }
      if (enumFieldClass) {
        const newSt: StatUses[] = []
        for (const st of Object.entries(enumFieldClass._literals)) {
          if (model.isMixedIn(st[1] as Attribute, ui.mixin.UXAttribute)) {
            const lit = model.as<UXAttribute>(st[1] as Attribute, ui.mixin.UXAttribute)
            newSt.push({
              id: st[1].ordinal,
              label: lit.label,
              color: lit.color as string,
              hidden: false,
              defValue: newSt.length == 0,
              divTasks: HTMLElement
            })
          } else {
            newSt.push({
              id: st[1].ordinal,
              label: st[1].label,
              color: '',
              hidden: false,
              defValue: newSt.length == 0,
              divTasks: HTMLElement
            })
          }
        }
        statuses = newSt
      }
    })
  }

  let docs: VDoc[] = []
  let dragDoc: VDoc | null = null

  let tq
  $: if (space) {
    tq = liveQuery(tq, _class, { _space: space._id }, (res) => {
      docs = res
      console.log('DOCS', docs)
    })
  }

  function docsFor (tasks: VDoc[], status: any, defValue: boolean, fieldAttr: AttributeMatch): VDoc[] {
    const res = tasks
      .filter((t) => {
        const fv = getFieldValue(t, fieldAttr.name)
        return fv === status || (defValue && !fv)
      })
      .sort((a, b) => {
        if (a._modifiedOn !== undefined && b._modifiedOn !== undefined) {
          return (b._modifiedOn as number) - (a._modifiedOn as number)
        }
        if (a._modifiedOn === undefined && b._modifiedOn === undefined) {
          return 0
        }
        if (a._modifiedOn === undefined) {
          return 1
        }
        return -1
      })
    console.log('DOCS for State', status, res)
    return res
  }

  function changeStat (sid: any): void {
    statuses = statuses.map((s) => {
      if (s.id === sid) {
        s.hidden = !s.hidden
      }
      return s
    })
  }

  function onDrag (value: CustomEvent<CardDragEvent<VDoc>>): void {
    if (value.detail.doc) {
      dragDoc = value.detail.doc
    }
    if (value.detail.dragged) {
      dragId = (value.detail.doc as any)[fieldAttr.name]
    } else {
      if (dragIn != null && dragDoc && getFieldValue(dragDoc, fieldAttr.name) !== dragIn) {
        const dt = dragDoc
        coreService.then((cs) => {
          cs.update(dt, null, { [fieldAttr.key]: dragIn as Property<any, any> })
        })
      }
      dragIn = null
    }
  }

  function onMove (value: unknown): void {
    const event = value.detail.event
    if (dragIn !== whereInStatus(event.detail.x)) {
      dragIn = whereInStatus(event.detail.x)
    }
  }

  function whereInStatus (coordX: number): any | null {
    for (const el of statuses) {
      const obj = el.divTasks.getBoundingClientRect()
      if (coordX >= obj.left && coordX <= obj.right) {
        return el.id
      }
    }
    return null
  }

  function getFieldValue (doc: VDoc, name: string): any {
    return (doc as any)[name]
  }

</script>

<div class="cards-view">
  {#each statuses as stat (stat.id)}
    <div class="cards-status" class:thin={stat.hidden}>
      {#if stat.hidden}
        <a
          href="/"
          class="resizer"
          on:click|preventDefault={() => {
            changeStat(stat.id)
          }}>
          <Icon icon={workbench.icon.Resize} button="true" />
        </a>
      {/if}
      <div class="status__label" class:sl-mini={stat.hidden}>
        <button
          class="status__button"
          class:rotated={stat.hidden}
          style="background-color: {stat.color || 'black'}"
          on:click={() => {
            changeStat(stat.id)
          }}>{stat.label}</button>
      </div>

      <div bind:this={stat.divTasks} class="status__tasks" class:hidden={stat.hidden}>
        {#if dragIn === stat.id && dragDoc && dragIn !== getFieldValue(dragDoc, fieldAttr.name)}
          <Card
            doc={dragDoc}
            {presenter}
            duplicate={true} />
          <div class="separator"></div>
        {/if}
        {#each docsFor(docs, stat.id, stat.defValue, fieldAttr) as doc (doc._id)}
          <div class="separator"></div>
          <Card
            {doc}
            {presenter}
            on:drag={onDrag}
            on:move={onMove} />
        {/each}
      </div>
    </div>
    <div class="status-separator"></div>
  {/each}
</div>

<style lang="scss">
  .cards-view {
    user-select: none;
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 100%;

    .cards-status {
      display: flex;
      flex-direction: column;
      position: relative;
      flex-basis: 250px;

      .status__label {
        display: flex;
        max-width: 250px;
        width: 100%;
        height: 24px;
        justify-content: center;
        align-items: center;
      }

      .status__button {
        display: flex;
        width: 100%;
        height: 24px;
        font-weight: 500;
        font-size: 11px;
        border: none;
        border-radius: 4px;
        justify-content: center;
        align-items: center;
        color: var(--white-color);
        outline: none;
        cursor: pointer;
      }

      .rotated {
        width: 120px;
        max-width: 120px;
        min-width: 120px;
        transform: rotate(-90deg) translate(calc(-50% + 12px), 0px);
      }

      .status__tasks {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        overflow: auto;
      }

      .separator {
        height: 12px;
      }
    }

    .thin {
      width: 24px;
      max-width: 24px;
    }
  }

  .hidden {
    visibility: hidden;
  }

  .sl-mini {
    width: 24px;
  }

  .status-separator {
    min-width: 16px;

    &:last-child {
      min-width: 0px;
    }
  }

  .resizer {
    position: absolute;
    top: 132px;
    left: 3px;
  }
</style>
