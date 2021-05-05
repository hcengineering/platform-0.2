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

<script lang="ts">
  import ActivityStatus from './ActivityStatus.svelte'
  import Applications from './Applications.svelte'
  import NavHeader from './NavHeader.svelte'
  import NavItem from './NavItem.svelte'
  import NavSubitem from './NavSubitem.svelte'
  import AppHeader from './AppHeader.svelte'
  import AsideHeader from './AsideHeader.svelte'
  import avatar from '../../img/avatar.png'
</script>

<div class="container">
  <div class="applications">
    <ActivityStatus status="active"/>
    <Applications active="home"/>
    <div class="profile">
      <img class="avatar" src={avatar} alt="Profile"/>
    </div>
  </div>
  <div class="navigator">
    <NavHeader/>
    <NavItem icon="thread" title="Threads"/>
    <NavItem icon="mention" title="Mentions" counter="8"/>
    <div class="separator"></div>
    <NavItem icon="arrow" group title="Starred">
      <NavSubitem title="project / channel"/>
      <NavSubitem locked title="project / channel"/>
      <NavSubitem type="user" img="tim" title="person" counter="2"/>
    </NavItem>
    <NavItem icon="arrow" group title="Channels" state="expanded">
      <NavSubitem title="random"/>
      <NavSubitem title="general"/>
      <NavSubitem title="achievements"/>
      <NavSubitem title="boring project"/>
      <NavSubitem title="fun project" locked/>
      <NavSubitem title="secret project" locked/>
    </NavItem>
    <NavItem icon="arrow" group title="Messages">
      <NavSubitem type="user" img="tim" title="Tim Ferris" counter="8"/>
      <NavSubitem type="user" img="chen" title="Rosamund Chen"/>
      <NavSubitem type="user" img="elon" title="Elon Musk"/>
    </NavItem>
  </div>
  <div class="component">
    <AppHeader title="boring project" subtitle="27 members"/>
  </div>
  <div class="aside">
    <AsideHeader title="Applications"/>
  </div>
</div>

<style lang="scss">
  @mixin panel($bg-color) {
    display: flex;
    flex-direction: column;
    height: 100%;
    border-radius: 20px;
    background-color: $bg-color;
  }

  .container {
    display: flex;
    flex-direction: row;
    height: 100%;
    padding-bottom: 20px;

    .applications {
      @include panel('transparent');
      justify-content: space-between;
      align-items: center;
      min-width: 96px;

      .profile {
        display: flex;
        align-items: center;
        height: 100px;
        min-height: 100px;
        .avatar {
          width: 36px;
          height: 36px;
        }
      }
    }

    .navigator {
      @include panel(var(--theme-bg-color));
      width: 280px;
      min-width: 280px;
      margin-right: 20px;

      .separator {
        width: 100%;
        height: 1px;
        min-height: 1px;
        margin: 24px 0;
        background-color: var(--theme-menu-divider);
      }
    }

    .component {
      @include panel(var(--theme-bg-color));
      flex-grow: 1;
      margin-right: 20px;
    }

    .aside {
      @include panel(var(--theme-bg-color));
      min-width: 400px;
      margin-right: 20px;
    }
  }
</style>