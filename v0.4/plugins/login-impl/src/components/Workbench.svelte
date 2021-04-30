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
</script>

<div class="container">
  <div class="applications">

  </div>
  <div class="navigator">

  </div>
  <div class="component">

  </div>
  <div class="aside">

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
      min-width: 96px;
    }
    .navigator {
      @include panel(var(--theme-bg-color));
      min-width: 280px;
      margin-right: 20px;
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