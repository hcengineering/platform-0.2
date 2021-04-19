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
  import { Button, EditBox } from '@anticrm/sparkling-controls'
</script>

<div class="container">
  <div class="reg-panel">
    <div class="form-container">
      <div class="form">
        <div class="title">Sign up to Platform</div>
        <div class="form-row wCol">
          <div class="form-col"><EditBox label="First Name"/></div>
          <div class="form-col"><EditBox label="Last Name"/></div>
        </div>
        <div class="form-row"><EditBox label="E-mail"/></div>
        <div class="form-row"><EditBox label="Password"/></div>
        <div class="send"><Button label="Sign Up" primary width="100%"/></div>
      </div>
      <div class="back-panel-dark"/>
      <div class="back-panel-light"/>
    </div>
    <div class="reg-footer">Already have an account?</div>
  </div>
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
    position: relative;
    display: flex;
    flex-direction: row;
    height: 100%;
    padding: 20px;
    font-family: inherit;
    &:after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: url("http://platform.exhale24.ru/img/back.png");
      opacity: 0.02;
    }

    .reg-panel {
      position: relative;
      display: flex;
      flex-direction: column;
      width: 668px;
      padding: 60px 80px;
      border-radius: 20px;

      .form-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex-grow: 1;

        .form {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 414px;
          z-index: 100;

          .title {
            margin-bottom: 56px;
            height: 56px;
            font-weight: 600;
            font-size: 24px;
            line-height: 29px;
            color: #FFFFFF;
          }
          .form-row {
            margin-bottom: 24px;
            &.wCol {
              display: flex;
              flex-direction: row;
              flex-wrap: nowrap;
            }
            .form-col {
              flex-grow: 1;
              &:last-child {
                margin-left: 12px;
              }
            }
          }
          .send {
            margin-top: 32px;
          }
        }
      }
      .reg-footer {
        font-size: 13px;
        line-height: 16px;
        color: #FFFFFF;
        z-index: 99;
      }

      .back-panel-light {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 20px;
        background: #CDA6FF;
        opacity: 0.02;
        &:after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 20px;
          background: url("http://platform.exhale24.ru/img/back.png");
          opacity: 0.02;
        }
      }
      .back-panel-dark {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 20px;
        background: #1D1D23;
        opacity: 0.5;
        &:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 20px;
          background: linear-gradient(158.74deg, rgba(205, 166, 255, 0.12) 5.62%, rgba(255, 255, 255, 0) 97.09%);
          opacity: 0.03;
        }
      }
    }

    .intro {
      display: flex;
      flex-direction: column;
      flex-grow: 1;

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
            background: center url("http://platform.exhale24.ru/img/p.svg");
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