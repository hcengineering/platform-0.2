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
<script type="ts">
  import core from '@anticrm/model'
  import { createLiveQuery } from '@anticrm/presentation'
  import ScrollView from '@anticrm/sparkling-controls/src/ScrollView.svelte'
  import DashboardItem from './DashboardClockWidget.svelte'
  import Chart from './simpleChart.svelte'
  import type { Platform } from '@anticrm/platform'
  import { getContext, onDestroy } from 'svelte'
  import login,{LoginService} from '@anticrm/login'

  import type { Class, Doc, Ref, Tx } from '@anticrm/core'
  import type { Space,CreateTx } from '@anticrm/domains'
  import { CORE_CLASS_CREATE_TX,TX_DOMAIN } from '@anticrm/domains'
  import { CORE_CLASS_VDOC } from '@anticrm/domains'
  import type { AttrModel, ClassModel } from '@anticrm/presentation/src/index'
  import { liveQuery } from '@anticrm/presentation/src/index'
  import { getEmptyModel, getPresentationService } from '@anticrm/presentation/src/utils'

  let tx: Tx
  console.log('core',core)

  let _class: Ref<Class<Doc>>

  // let model: ClassModel = getEmptyModel()
  // let modelClass: Ref<Class<Doc>>
  // let attributes: AttrModel[] = []

  // $: {
  //   if (_class && _class !== modelClass) {
  //     getPresentationService()
  //       .then((p) => p.getClassModel(_class, CORE_CLASS_VDOC))
  //       .then((m) => {
  //         model = m
  //         modelClass = _class
  //         attributes = model.getAttributes()
  //       })
  //   }
  // } 

  let spaceObjects: Space[];
  
  createLiveQuery(core.class.Space, {}, (docs) => {
    console.log('docs',docs);
    spaceObjects = docs.filter((item) => item.spaceKey === 'TSK' );
  });
    
  // let lqObjects
  // $: if(spaceObjects && spaceObjects._id){
  //   lq = liveQuery(lq, _class, { _space: spaceObjects._id }, (docs) => {
  //   console.log('lqDocs', docs)
  //   lqObjects = docs
  // })}


  const user = { username: '', workspace: '' }
  const platform = getContext('platform') as Platform
    // console.log('platform',platform);
  const loginService = platform.getPlugin(login.id)
    // console.log('loginService',loginService);

    async function checkLoginInfo (ls: LoginService) {
    const info = await ls.getLoginInfo()
    if (info) {
      user.username = info.email
      user.workspace = info.workspace
    }
  }

  let timer: number
  // Auto forward to default application
  const loginCheck = loginService.then(async (ls) => {
    await checkLoginInfo(ls).then(()=>{console.log('user', user)})
    timer = setInterval(async () => {
      await checkLoginInfo(ls)
    }, 1000)
  })

  onDestroy(() => {
    if (timer) {
      clearInterval(timer)
    }
  })

// createLiveQuery(CORE_CLASS_CREATE_TX, {}, (docs) => {
//     objects = docs
//     console.log('objects',objects);
//   })

</script>

<div class="Dashboard">
  <div class="captionContainer">
    <span class="caption-1">Dashboard</span>&nbsp;
  </div>
  <ScrollView height="100%" margin="2em" >
    <div class="content">
      <div class="grid-container">
        <DashboardItem class="grid-item Clock" {user} />
        <div class="grid-item news">NEWS</div>
        <Chart class="grid-item chart">CHART</Chart>
        <div class="grid-item some">???</div>
      </div>
    </div>
  </ScrollView>
</div>

<style lang="scss">
  .Dashboard {
    height: 100%;
    // background-color: red;
    display: flex;
    flex-direction: column;

    .captionContainer {
      box-sizing: border-box;
      width: 100%;
      height: 5em;
      padding: 2em;
      border-bottom: 1px solid var(--theme-bg-accent-color);
      display: flex;
      align-items: center;
    }

    .content {
      flex-grow: 1;
      height: 100%;
    }
    .grid-container {
      height: 100%;
      flex-grow: 1;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      grid-template-rows: repeat(auto-fit, minmax(200px, 1fr));
      grid-auto-rows: 200px;
      grid-auto-columns: 200px;
      gap: 1em 1em;
      grid-template-areas:
        "Clock Clock news"
        "chart chart some"
        "chart chart some";

      :global(.grid-item){
        box-sizing: border-box;
        height: 100%;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 0.5px solid azure;
      }

      :global(.chart) { grid-area: chart; }

      :global(.Clock) { grid-area: Clock; }

      :global(.news) { grid-area: news; }

      :global(.some) { grid-area: some; }
    }


  }
</style>
