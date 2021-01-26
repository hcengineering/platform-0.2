<script lang='ts'>
  import { Space } from '@anticrm/core'
  import { archivedSpaceUpdate, getCurrentUserSpace, getSpaceName, leaveSpace } from './utils'
  import { _getCoreService, getUIService } from '../../../utils'
  import SimplePopup from '@anticrm/presentation/src/components/SimplePopup.svelte'
  import { createEventDispatcher } from 'svelte'
  import AddUser from './AddUser.svelte'

  export let link: string = '/'
  export let selected: boolean = false
  export let space: Space = {} as Space
  export let count: number = 0

  const coreService = _getCoreService()
  const uiService = getUIService()

  const dispatch = createEventDispatcher()

  let optionsButton: HTMLElement

  function addUser () {

  }

  function getActions () {
    let actions = []
    if (!space.archived) {
      actions = [{
        name: 'Add user',
        action: () => {
          uiService.showModal(AddUser, { space }, optionsButton)
          // dispatch('close')
        }
      }, {
        name: '-',
        style: 'separator'
      }]

      if (space.isPublic || !getCurrentUserSpace(coreService.getUserId(), space).owner) {
        // We could leave
        actions.push({
          name: 'Leave',
          action: () => {
            leaveSpace(coreService, space)
            dispatch('close')
          }
        })
      } else {
        actions.push({
          name: 'Archive',
          action: () => {
            archivedSpaceUpdate(coreService, space, !space.archived)
            dispatch('close')
          }
        })
      }

    }
    return actions
  }
</script>

<SimplePopup items={getActions()} />



