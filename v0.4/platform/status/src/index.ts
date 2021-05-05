//
// Copyright © 2020, 2021 Anticrm Platform Contributors.
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
//

/**
 * Anticrm Platform Foundation Types
 * @packageDocumentation
 */

/**
 * Status severity
 * @public
 */
export enum Severity {
  OK = 'OK',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

/**
 * Component that created status object
 * @public
 */
export type Component = string & { __component: true }
export type StatusCode<P extends Record<string, any> = {}> = number & { __params: P}

/**
 * Status of an operation
 * @public
 */
export class Status<P = {}> {
  readonly severity: Severity
  readonly component: Component
  readonly code: StatusCode<P>
  readonly params: P

  constructor (severity: Severity, component: Component, code: StatusCode<P>, params: P) {
    this.severity = severity
    this.component = component
    this.code = code
    this.params = params
  }
}

/**
 * Error object wrapping `Status`
 * @public
 */
export class PlatformError<P extends Record<string, any>> extends Error {
  readonly status: Status<P>

  constructor (status: Status<P>) {
    super(`${status.severity} in '${status.component}' code: ${status.code}`)
    this.status = status
  }
}
