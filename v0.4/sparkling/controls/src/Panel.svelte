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

<div class="reg-panel">
  <div class="back-panel-dark"/>
  <div class="back-panel-light">
    <div class="bg-noise opacity-3"/>
  </div>
  <slot/>
</div>

<style lang="scss">
  @import "@anticrm/sparkling-theme/styles/mixins.scss";

  .reg-panel {
    position: relative;
    overflow: hidden;
    margin-right: 20px;
    width: 668px;
    padding: 20px 15px;
    border-radius: 20px;

    .back-panel-light {
      @include bg-layer(linear-gradient(158.74deg, rgba(205, 166, 255, 0.12) 5.62%, rgba(255, 255, 255, 0) 97.09%), 0.3);
      z-index: -1;
    }
    .back-panel-dark {
      @include bg-layer(#1D1D23, 0.5);
      z-index: -1;
    }
  }
</style>