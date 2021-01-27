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
 * Platform Resource Identifier (PRI)
 *
 * @remarks
 *
 * Almost anything in the Anticrm Platform is a `Resource`. Resources referenced by Platform Resource Identifier (PRI).
 *
 * TODO: understand Resource better. Is this just a `platform` thing or should be in `core` as well
 *
 * 'Resource' is simply any JavaScript object. There is a plugin exists, which 'resolve' PRI into actual object.
 * This is a difference from Metadata. Metadata object 'resolved' by Platform instance, so we may consider Metadata as
 * a Resource, provided by Platform itself. Because there is always a plugin, which resolve `Resource` resolution is
 * asynchronous process.
 *
 * `Resource` is a string of `kind:plugin.id` format. Since Metadata is a kind of Resource.
 * Metadata also can be resolved using resource API.
 *
 * @example
 * ```typescript
 *   `class:contact.Person` as Resource<Class<Person>> // database object with id === `class:contact.Person`
 *   `string:class.ClassLabel` as Resource<string> // translated string according to current language and i18n settings
 *   `asset:ui.Icons` as Resource<URL> // URL to SVG sprites
 *   `easyscript:2+2` as Resource<() => number> // function
 * ```
 *
 * @public
 */
export type Resource<T> = string & { __resource: T }

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
 * Status of an operation
 * @public
 */
export class Status {
  severity: Severity
  code: number
  message: string

  constructor (severity: Severity, code: number, message: string) {
    this.severity = severity
    this.code = code
    this.message = message
  }
}

/**
 * Error object wrapping `Status`
 * @public
 */
export class PlatformError extends Error {
  readonly status: Status

  constructor (status: Status) {
    super(status.message)
    this.status = status
  }
}
