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
  OK,
  INFO,
  WARNING,
  ERROR
}

/**
 * Component that created status object
 * @public
 */
export type Component = string & { __component: true }

/**
 * Status of an operation
 * @public
 */
export class Status {
  readonly severity: Severity
  readonly component: Component
  readonly code: number
  readonly params: any

  constructor (severity: Severity, component: Component, code: number, params?: any) {
    this.severity = severity
    this.component = component
    this.code = code
    this.params = params
  }
}

/**
 * Platform component Id
 * @public
 */
export const Platform = 'platform' as Component

/**
 * Platfrom Status Code
 * @public
 */
export enum PlatformStatusCode {
  OK,
  UNKNOWN_ERROR
}

/**
 * OK Status
 * @public
 */
export const OK = new Status(Severity.OK, Platform, PlatformStatusCode.OK)

/** 
 * Creates unknown error status
 * @public
 */
export function unknownError (err: Error): Status {
  return new Status(Severity.ERROR, Platform, PlatformStatusCode.UNKNOWN_ERROR, { message: err.message })
}

/**
 * Error object wrapping `Status`
 * @public
 */
export class PlatformError extends Error {
  readonly status: Status

  constructor (status: Status) {
    super(`${status.severity} in '${status.component}' code: ${status.code}`)
    this.status = status
  }
}
