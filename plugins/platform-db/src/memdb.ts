//
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
// 

import { Platform } from '@anticrm/platform'

import { Db, Container, ClassId, ContainerId, ContainerClass } from '.'

type LayoutType = string | number | ContainerId

function filterEq(docs: any, propertyKey: string, value: LayoutType): any[] {
  const result = []
  for (const doc of docs) {
    if (value === doc[propertyKey]) {
      result.push(doc)
    }
  }
  return result
}

export class MemDb implements Db {
  private objects = new Map<ContainerId, Container>()
  private byClass = new Map<ClassId, Container[]>()
  private hierarchy = new Map<ClassId, ClassId[]>()

  private add(doc: Container) {
    const id = doc._id
    if (this.objects.get(id))
      throw new Error('container already loaded: ' + id.toString())
    this.objects.set(id, doc)
  }

  get(_id: ContainerId): Container {
    const result = this.objects.get(_id)
    if (!result) {
      throw new Error('no container with id ' + _id)
    }
    return result
  }

  createContainer(_id: ContainerId, _class: ClassId): Container {
    const container = {
      _id,
      _class
    }
    this.objects.set(_id, container) // TODO: update index
    return container
  }

  pick(id: ContainerId): Container | undefined {
    return this.objects.get(id)
  }

  private getAllOfClass(clazz: ClassId): Container[] {
    let docs = this.byClass.get(clazz)
    if (!docs) {
      docs = []
      this.byClass.set(clazz, docs)
    }
    return docs
  }

  private getSubclasses(clazz: ClassId): ClassId[] {
    let result = this.hierarchy.get(clazz)
    if (!result) {
      result = [] as ClassId[]
      this.hierarchy.set(clazz, result)
    }
    return result
  }

  private addSubclass(clazz: ClassId, subclass: ClassId): void {
    const subclasses = this.getSubclasses(clazz)
    if (!subclasses.includes(subclass)) {
      subclasses.push(subclass)
    }
  }

  narrow(clazz: ClassId): ClassId {
    while (true) {
      const subclasses = this.getSubclasses(clazz)
      if (subclasses.length === 1)
        clazz = subclasses[0]
      else
        return clazz
    }
  }

  getClass(_class: ClassId): ContainerClass {
    return this.get(_class) as ContainerClass
  }

  index(container: Container) {
    let _class = container._class as ClassId | undefined
    while (_class) {
      this.getAllOfClass(_class).push(container)
      const superClass = this.getClass(_class)._extends
      if (superClass) {
        this.addSubclass(superClass, _class)
      }
      _class = superClass
    }
  }

  findAll(clazz: ClassId, query: { [key: string]: LayoutType }): Container[] {
    const docs = this.getAllOfClass(clazz)
    let result = docs

    for (const propertyKey in query) {
      result = filterEq(result, propertyKey, (query as any)[propertyKey])
    }

    return result
  }

  load(docs: Container[]) {
    docs.forEach(doc => this.add(doc))
    docs.forEach(doc => this.index(doc))
  }

  dump(): Container[] {
    const result = [] as Container[]
    this.objects.forEach(doc => result.push(doc))
    return result
  }
}

export default async (platform: Platform, deps: {}) => {
  /*!
   * Anticrm Platform Database Plugin
   * Copyright © 2020 Anticrm Platform Contributors. All Rights Reserved.
   * Licensed under the Eclipse Public License, Version 2.0
   */
  return new MemDb()
}

