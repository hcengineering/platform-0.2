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
  import { Button, EditBox, Status, Panel } from '@anticrm/sparkling-controls'
  let fname: string = ''
  let lname: string = ''
</script>

<div class="container">
  <Panel>
    <div class="form-container">
      <div class="separator-footer"/>
      <div class="title">Sign up</div>
      <div class="status">
        {#if fname == 'error'}
          <Status severity="ERROR" message="Error: {lname}" width="100%"/>
        {/if}
      </div>
      <div class="form">
        <div class="form-col"><EditBox label="First Name" bind:value={fname}/></div>
        <div class="form-col"><EditBox label="Last Name" bind:value={lname}/></div>
        <div class="form-row"><EditBox label="E-mail"/></div>
        <div class="form-row"><EditBox label="Password" password/></div>
        <div class="form-row"><EditBox label="Repeat password" password/></div>
        <div class="form-row send"><Button label="Sign Up" primary width="100%"/></div>
      </div>
      <div class="separator-footer"/>
      <div class="reg-footer"><span>Already have an account?</span> <a href="/login">Sign In</a></div>
    </div>
  </Panel>
  <div class="intro">
    <div class="content">
      <div class="logo"> </div>
    </div>
    <div class="slogan">
      <p>A unique place to manage all of your work</p>
      <p>Welcome to the Platform</p>
    </div>
  </div>
</div>

<style lang="scss">
  .container {
    display: flex;
    flex-direction: row;
    height: 100%;
    padding: 20px;


    .form-container {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      padding: 60px 65px;
      height: 100%;

      .title {
        font-weight: 600;
        font-size: 24px;
        line-height: 29px;
        color: #FFFFFF;
      }
      .status {
        min-height: 120px;
        max-height: 120px;
        padding-top: 20px;
      }
      
      .form {
        display: grid;
        grid-template-columns: 1fr 1fr;
        column-gap: 12px;
        row-gap: 24px;

        .form-row {
          grid-column-start: 1;
          grid-column-end: 3;
        }
        @media (max-width: 985px) {
          .form-col {
            grid-column-start: 1;
            grid-column-end: 3;
          }
        }
        .send {
          margin-top: 36px;
        }
      }
      .separator-footer {
        flex-grow: 1;
      }
      .reg-footer {
        margin-top: 56px;
        font-size: 13px;
        line-height: 16px;
        color: #FFFFFF;
        span {
          opacity: 0.3;
        }
        a {
          color: #fff;
          opacity: 0.8;
          text-decoration: none;
          :hover {
            opacity: 1;
          }
        }
      }
    }

    .intro {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      overflow: hidden;
      min-width: 320px;

      .content {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        justify-content: center;
        align-items: center;
        .logo {
          position: relative;
          &:after {
            position: absolute;
            content: "";
            background: center url("../../img/logo.svg");
            transform: translate(-50%, -50%);
            width: 63px;
            height: 79px;
          }
          &:before {
            position: absolute;
            content: "";
            transform: translate(-50%, -50%);
            width: 255px;
            height: 255px;
            border: 1.8px solid #FFFFFF;
            border-radius: 50%;
            opacity: 0.08;
          }
        }
      }
      .slogan {
        margin-bottom: 60px;
        p {
          margin: 0;
          font-weight: 400;
          font-size: 13px;
          line-height: 19px;
          text-align: center;
          color: #FFFFFF;
          opacity: 0.8;
        }
      }
    }
  }
</style>