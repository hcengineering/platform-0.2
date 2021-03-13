<script type='ts'>
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

  import { Property, Ref, StringProperty } from '@anticrm/core'
  import { Space, CORE_CLASS_SPACE } from '@anticrm/domains'
  import { MessageNode } from '@anticrm/text'
  import ReferenceInput from '@anticrm/presentation/src/components/refinput/ReferenceInput.svelte'
  import ScrollView from '@anticrm/sparkling-controls/src/ScrollView.svelte'
  import { onDestroy } from 'svelte'
  import chunter, { getChunterService, Message } from '../..'
  import CommentComponent from './Comment.svelte'
  import DateItem from './DateItem.svelte'
  import { getRunningService } from '@anticrm/platform-ui'
  import core from '@anticrm/platform-core'
  import SplitView from '@anticrm/sparkling-controls/src/SplitView.svelte'

  const coreService = getRunningService(core.id)
  const chunterService = getChunterService()

  export let space: Space

  let spaceName: string
  let messages: Message[] = []

  const ms = coreService.subscribe(chunter.class.Message, { _space: space._id }, (docs) => {
    messages = docs
  }, onDestroy)

  $: {
    ms(chunter.class.Message, { _space: space._id })
    // TODO: use Titles index instead of getting the whole Space object
    coreService.findOne(CORE_CLASS_SPACE, { _id: space._id })
      .then((spaceObj) => (spaceName = spaceObj ? '#' + spaceObj.name : ''))
  }

  function createMessage (message: MessageNode) {
    if (message) {
      chunterService.then((chunterService) => {
        const parsedMessage = chunterService.createMissedObjects(message)

        const comment = {
          _createdOn: Date.now() as Property<number, Date>,
          _createdBy: coreService.getUserId() as StringProperty,
          message: parsedMessage as StringProperty
        }
        // absent VDoc fields will be autofilled
        coreService.create(chunter.class.Message, {
          _space: space._id,
          comments: [comment]
        })
      })
    }
  }
</script>

<style lang='scss'>
  .chat {
    height: 100%;
    display: flex;
    flex-direction: column;

    .content {
      flex-grow: 1;
    }

    .captionContainer {
      box-sizing: border-box;
      width: 100%;
      height: 5em;
      padding: 2em;
      border-bottom: 1px solid var(--theme-bg-accent-color);
      display: flex;
      align-items: center;
    }

    .refContainer {
      margin: 0 2em 2em 2em;
    }
  }
</style>

<div class='chat'>
  <div class='captionContainer'>
    <span class='caption-1'>Chat {spaceName}</span>&nbsp;
  </div>
  <ScrollView height="100%" margin="2em" autoscroll={true}>
    <div class='content'>
      {#each messages as message (message._id)}
        {#if message.comments}
          <CommentComponent message={message.comments[0]} />
        {/if}
      {/each}
      <DateItem dateItem={new Date()} />
      <SplitView width="100%" height="200px" spacing="10" minWidth="50">
        <div slot="prevContent">Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem beatae necessitatibus, accusantium exercitationem ipsa fugiat mollitia aperiam optio quae modi labore eos ipsum porro, placeat nisi commodi excepturi molestiae consequatur.
          Earum doloremque rem quibusdam natus velit fugiat quos repellat, eius impedit similique veritatis placeat ipsam esse tenetur ex mollitia numquam sequi reprehenderit beatae animi dicta. Rerum sint quo nihil necessitatibus?
          Similique aperiam, magni hic quasi blanditiis reprehenderit. Dolore sequi deleniti, tenetur voluptatibus itaque eum porro laborum quod tempora dolores voluptate rerum cumque blanditiis cupiditate sit velit laboriosam molestiae, perferendis architecto!
          Quam vel porro fugit commodi ab quaerat facere obcaecati voluptatum, iusto iure quisquam adipisci sapiente recusandae non perspiciatis voluptates sed id provident assumenda culpa autem blanditiis quibusdam? Autem, accusamus reprehenderit!
          Saepe quidem repellendus labore modi ullam eos tenetur quibusdam deleniti repellat nulla cumque deserunt fugit doloribus cum illum ratione fugiat distinctio inventore explicabo numquam repudiandae natus, odit et voluptas? Nemo.
          Cumque eos asperiores harum et, possimus, itaque quod doloribus repellat amet quasi aliquam cupiditate quis corrupti sequi tempora. Velit quidem nemo quae? Cupiditate officia ad inventore nam, incidunt assumenda molestiae.
          Voluptates reprehenderit repellat eligendi dignissimos ratione aliquid distinctio, dolorem eius alias laborum perferendis nihil ipsam quisquam! Sunt id in neque doloribus. Commodi labore facere sapiente dicta voluptate eaque necessitatibus animi.
          Molestias omnis quasi esse, vero rerum asperiores culpa distinctio commodi laudantium error dicta ullam earum, eveniet magnam harum porro adipisci vitae, fuga odit. Ducimus ex vitae facilis accusantium cupiditate corrupti?
          Enim labore sit corporis blanditiis aliquam nesciunt harum quas quae sapiente non officiis asperiores, quo, quasi nam repellendus laborum commodi nisi iure fuga autem. Quaerat voluptate sequi enim ut hic?
          Magnam saepe iusto voluptatibus nostrum quos eligendi suscipit minima iste, earum corrupti officiis molestias enim recusandae at aspernatur repudiandae praesentium, eveniet amet odio illum deserunt asperiores? Natus officia culpa et.
        </div>
        <div slot="nextContent">
          <SplitView width="100%" height="200px" spacing="10" minWidth="50" horizontal>
            <div slot="prevContent">Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem beatae necessitatibus, accusantium exercitationem ipsa fugiat mollitia aperiam optio quae modi labore eos ipsum porro, placeat nisi commodi excepturi molestiae consequatur.
              Earum doloremque rem quibusdam natus velit fugiat quos repellat, eius impedit similique veritatis placeat ipsam esse tenetur ex mollitia numquam sequi reprehenderit beatae animi dicta. Rerum sint quo nihil necessitatibus?
              Similique aperiam, magni hic quasi blanditiis reprehenderit. Dolore sequi deleniti, tenetur voluptatibus itaque eum porro laborum quod tempora dolores voluptate rerum cumque blanditiis cupiditate sit velit laboriosam molestiae, perferendis architecto!
              Quam vel porro fugit commodi ab quaerat facere obcaecati voluptatum, iusto iure quisquam adipisci sapiente recusandae non perspiciatis voluptates sed id provident assumenda culpa autem blanditiis quibusdam? Autem, accusamus reprehenderit!
              Saepe quidem repellendus labore modi ullam eos tenetur quibusdam deleniti repellat nulla cumque deserunt fugit doloribus cum illum ratione fugiat distinctio inventore explicabo numquam repudiandae natus, odit et voluptas? Nemo.
              Cumque eos asperiores harum et, possimus, itaque quod doloribus repellat amet quasi aliquam cupiditate quis corrupti sequi tempora. Velit quidem nemo quae? Cupiditate officia ad inventore nam, incidunt assumenda molestiae.
              Voluptates reprehenderit repellat eligendi dignissimos ratione aliquid distinctio, dolorem eius alias laborum perferendis nihil ipsam quisquam! Sunt id in neque doloribus. Commodi labore facere sapiente dicta voluptate eaque necessitatibus animi.
              Molestias omnis quasi esse, vero rerum asperiores culpa distinctio commodi laudantium error dicta ullam earum, eveniet magnam harum porro adipisci vitae, fuga odit. Ducimus ex vitae facilis accusantium cupiditate corrupti?
              Enim labore sit corporis blanditiis aliquam nesciunt harum quas quae sapiente non officiis asperiores, quo, quasi nam repellendus laborum commodi nisi iure fuga autem. Quaerat voluptate sequi enim ut hic?
              Magnam saepe iusto voluptatibus nostrum quos eligendi suscipit minima iste, earum corrupti officiis molestias enim recusandae at aspernatur repudiandae praesentium, eveniet amet odio illum deserunt asperiores? Natus officia culpa et.
            </div>
            <div slot="nextContent">Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem beatae necessitatibus, accusantium exercitationem ipsa fugiat mollitia aperiam optio quae modi labore eos ipsum porro, placeat nisi commodi excepturi molestiae consequatur.
              Earum doloremque rem quibusdam natus velit fugiat quos repellat, eius impedit similique veritatis placeat ipsam esse tenetur ex mollitia numquam sequi reprehenderit beatae animi dicta. Rerum sint quo nihil necessitatibus?
              Similique aperiam, magni hic quasi blanditiis reprehenderit. Dolore sequi deleniti, tenetur voluptatibus itaque eum porro laborum quod tempora dolores voluptate rerum cumque blanditiis cupiditate sit velit laboriosam molestiae, perferendis architecto!
              Quam vel porro fugit commodi ab quaerat facere obcaecati voluptatum, iusto iure quisquam adipisci sapiente recusandae non perspiciatis voluptates sed id provident assumenda culpa autem blanditiis quibusdam? Autem, accusamus reprehenderit!
              Saepe quidem repellendus labore modi ullam eos tenetur quibusdam deleniti repellat nulla cumque deserunt fugit doloribus cum illum ratione fugiat distinctio inventore explicabo numquam repudiandae natus, odit et voluptas? Nemo.
              Cumque eos asperiores harum et, possimus, itaque quod doloribus repellat amet quasi aliquam cupiditate quis corrupti sequi tempora. Velit quidem nemo quae? Cupiditate officia ad inventore nam, incidunt assumenda molestiae.
              Voluptates reprehenderit repellat eligendi dignissimos ratione aliquid distinctio, dolorem eius alias laborum perferendis nihil ipsam quisquam! Sunt id in neque doloribus. Commodi labore facere sapiente dicta voluptate eaque necessitatibus animi.
              Molestias omnis quasi esse, vero rerum asperiores culpa distinctio commodi laudantium error dicta ullam earum, eveniet magnam harum porro adipisci vitae, fuga odit. Ducimus ex vitae facilis accusantium cupiditate corrupti?
              Enim labore sit corporis blanditiis aliquam nesciunt harum quas quae sapiente non officiis asperiores, quo, quasi nam repellendus laborum commodi nisi iure fuga autem. Quaerat voluptate sequi enim ut hic?
              Magnam saepe iusto voluptatibus nostrum quos eligendi suscipit minima iste, earum corrupti officiis molestias enim recusandae at aspernatur repudiandae praesentium, eveniet amet odio illum deserunt asperiores? Natus officia culpa et.
            </div>
          </SplitView>
        </div>
      </SplitView>
    </div>
  </ScrollView>
  <div class='refContainer'>
    <ReferenceInput on:message={(e) => createMessage(e.detail)} />
  </div>
</div>
