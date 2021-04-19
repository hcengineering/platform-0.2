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
  <div class="bg-noise opacity-2"/>
  <div class="bg-cover"/>
  <div class="reg-panel">
    <div class="back-panel-dark"/>
    <div class="back-panel-light"><div class="bg-noise opacity-3"/></div>
    <div class="form-container">
      <div class="form">
        <div class="title">Sign up</div>
        <div class="form-row wCol">
          <div class="form-col"><EditBox label="First Name"/></div>
          <div class="form-col"><EditBox label="Last Name"/></div>
        </div>
        <div class="form-row"><EditBox label="E-mail"/></div>
        <div class="form-row"><EditBox label="Password" password/></div>
        <div class="form-row"><EditBox label="Repeat password" password/></div>
        <div class="send"><Button label="Sign Up" primary width="100%"/></div>
      </div>
    </div>
    <div class="reg-footer"><span>Already have an account?</span> <a href="/login">Sign In</a></div>
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
  @mixin bg-fullsize {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
  }

  @mixin bg-layer($bg, $opacity) {
    @include bg-fullsize;
    background: $bg;
    opacity: $opacity;
  }

  .container {
    position: relative;
    display: flex;
    flex-direction: row;
    height: 100%;
    padding: 20px;
    font-family: inherit;
    background-color: #111117;

    .bg-cover {
      @include bg-layer(linear-gradient(112.79deg, #AEA4CC 2.31%, rgba(196, 150, 191, 0) 98.9%), 0.05);
      z-index: 5;
    }

    .reg-panel {
      position: relative;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      margin-right: 20px;
      width: 668px;
      padding: 60px 80px;
      border-radius: 20px;

      .back-panel-light {
        @include bg-layer(linear-gradient(158.74deg, rgba(205, 166, 255, 0.12) 5.62%, rgba(255, 255, 255, 0) 97.09%), 0.3);
      }
      .back-panel-dark {
        @include bg-layer(#1D1D23, 0.5);
      }

      .form-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        overflow: auto;
        flex-grow: 1;

        .form {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 414px;
          z-index: 100;

          .title {
            margin-bottom: 56px;
            font-weight: 600;
            font-size: 24px;
            line-height: 29px;
            color: #FFFFFF;
          }
          .form-row {
            margin-bottom: 20px;
            &.wCol {
              display: flex;
              flex-direction: row;
              flex-wrap: nowrap;
            }
            .form-col {
              flex-grow: 1;
              &:first-child {
                margin-right: 12px;
              }
            }
            @media (max-width: 865px) {
              &.wCol {
                flex-direction: column;
              }
              .form-col {
                &:first-child {
                  margin-right: 0px;
                  margin-bottom: 20px;
                }
              }
            }
          }
          .send {
            margin-top: 36px;
          }
        }
      }
      .reg-footer {
        font-size: 13px;
        line-height: 16px;
        color: #FFFFFF;
        z-index: 99;
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