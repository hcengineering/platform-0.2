---
title: Operation-API
menuPosition: 2

---

Here's the object access and object modification APIs described.



# Basics

At first we need to know how to obtain an object or set of object within a platform and understand how they are held underline in storage.



## Object access protocol: DocumentProtocol



```typescript
export interface DocumentProtocol {
  find<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>, options?: FindOptions<T>): Promise<T[]>
  findOne<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>): Promise<T | undefined>
  loadDomain (domain: string): Promise<Doc[]>
}
```

* find - perform a search for Documents inside storage and retrieve them at once.
* findOne - same, but find just one document.
* loadDomain - load a full set of docoments inside specific comain. Domain could be configured based on plugins.

### Query examples

Look for a class definition.

```typescript
const cs = await getCoreService()
const value: Class<Doc> = cs.find(CORE_CLASS_CLASS, {_id:'class:core.Class'}) // -> Will return instance of Class.
```

Look for a task definition:

```typescript
const cs = await getCoreService()
cs.find(taskIds.class.Task, { name: { $regex: 't.*t' as StringProperty } })
```

Look for embedded document by pattern:

```typescript
interface VersionInfo {
	version: string
  releaseDate: Date
  description: string
}
// Mixin 
interface VersionedTask extends Task {
  version: VersionInfo
}
const cs = await getCoreService()
cs.find(task.mixin.VersionedTask, { version: { version: "1.0.0" } })
```





## Object modification protocol: OperationProtocol

```typescript
export interface OperationProtocol {
	create<T extends Doc> (_class: Ref<Class<T>>, values: Partial<Doc>): Promise<T>
  update<T extends Doc> (doc: T, value: Partial<Omit<T, keyof Doc>>): Promise<T>
  updateWith<T extends Doc> (doc: T, builder: (s: TxBuilder<T>) => TxOperation | TxOperation[]): Promise<T>
  remove<T extends Doc> (doc: T): Promise<T>
}
```

* **create** - Perform creation of new document. Object ID will be automatically generated and assigned to object.
* **update** - Perform update of document properties.
* **updateWith** - Perform update of document/embedded document properties using a builder pattern. 
  It is possible to do a *set*, *pull*, *push* for different field values. *push* and *pull* are applicable only for array attributes.
  TxBuilder -> a query builder mechanism, it allow to select array, instance fields, arrays and perform a construction of modification path.
* **remove** - Perform remove of object.

### Modification examples

Examples will work with Space document type.

```typescript
export interface Space extends Doc {
  name: string // a space name
  description: string // a space optional description.

  application: Ref<Application> // An application space is belong to.
  applicationSettings?: Emb // Some custom application settings.

  spaceKey: string // A space shortId prefix.

  users: SpaceUser[] // A list of included user accounts, not all may be active.
  isPublic: boolean // If specified, a users are interpreted as include list.
  archived: boolean // If specified, channel is marked as archived, only owner could archive space
}
service: CoreService
s:Space // Some selected space
```

Modify values of space object:

```typescript
service.updateWith(s, (b) =>
  b.set({ description:"Some docs", isPublic: true }))
)
```



Push a new user into users array

```typescript
service.updateWith(s, (b) =>
    b.users.push({
      userId: cs.getUserId(),
      owner: false
    })
  )
```

Remove a user from users array:

```typescript
service.updateWith(s, (b) =>
  b.users.match({ userId: cs.getUserId() }).pull())
)
```

