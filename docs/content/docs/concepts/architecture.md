---
title: Architecture
menuPosition: 1
---

# The Platform

Anticrm Platform built around a few simple concepts:

* `Platform Object` -- a piece of information, typically persisted by the platform in a database. May refer another platform object and `Resource`s
* `Resource` -- something we can't persist in the database (e.g. JavaScript function, or "mailing service"), but want to refer from a `Platform Object`.
* `Plugin` -- piece of code, which provide `Resources` to the platform, and code to deal with `Platform Objects`.

Any Platform application is nothing but a bunch of installed plugins.
At the very core Platform is a simple piece of code, which connects plugins together and route resource requests.

## Platform Objects

Platform Objects utilize classical object-oriented model, so every platform object belongs to a particualar class. A `Class` may extend another class, and implement a number of interfaces. `Interface` may extend another interface as well. There is also concept of `Mixin`, which we'll describe later.

{{< mermaid >}}
classDiagram
Obj <|-- Emb
Obj <|-- Doc
Obj : Ref~Class~ _class
Obj --> Class

Doc <|-- Classifier
Doc : Ref~Doc~ _id

Classifier <|-- Interface
Classifier <|-- Class
Classifier : Type[] attributes
Classifier : Classifier extends
Classifier *-- Type
Classifier --> Classifier

Class : Interface implements
Class : string domain
Class o-- Interface

Class <|-- Mixin

Emb <|-- Type

{{< /mermaid >}}

There are no instances of `Obj`, `Doc`, `Class`... and other classes in the hierarchy exists. Those are abstract classes describing **models**. Platform instantiate **derived** classes,
which are either `Layout<Obj>` or `Instance<Obj>`.

| Layout<Obj>  |   Obj                | Instance<Obj> |
|--------------|----------------------|---------------|
|  Ref<Doc>    | Ref<Doc> (string)    | Ref<Doc>      |
|  LayoutType  | Property<T> (T)      | T             |
|  Resource<T> | Resource<T> (string) | T             |


## Resources

Resource can be anything meaningful: an object in external database, `Vue` component, an asset URL, etc.
For any `resource` there is a known `plugin`, which can *resolve* resource identifier into actual meaningful object.

Plugin is an *isolated* piece of software, and a plugin never directly `import` stuff from other plugins
(in sense of JavaScript `import` statement). Every plugin provide `Resources` via
`Platform` runtime. Resource accessible via PRI (Platform Resource Identifier).

### Why Resources?

Platform persists `Platform Objects` in the database. Platform objects uniquely identified and belongs to a `Class`. Any platform object may have properties, which can be:

* A reference to another platform object
* Embedded object (structure)
* Value of some type (including user-defined type)
* Resource

Resources play significant role in platform object persistence. Consider we have a property which refer to something we can't
persist in the database (something which live in runtime only, e.g. JavaScript function instance). So we can provide this function as `Resource` with `method:myplugin.Method` PRI. So `myplugin` will be responsible to provide the function at runtime.
Plaform will wire things together: platform object's property of Resource type with actual function provided under `method:myplugin.Method` PRI.

Examples of `Resource`:
```typescript
// database object with id === `class:contact.Person`
`class:contact.Person` as Resource<Class<Person>>
// translated string according to current i18n settings
`string:class.ClassLabel` as Resource<string> 
// URL to SVG sprites
`asset:ui.Icons` as Resource<URL> 
// Vue component for Person Form
`component:client.PersonForm` as Resource<Component<VueComp>> 
`easyscript:2+2` as Resource<() => number> // function
`object:5679fd5a459245ccb435` as Resource<Doc> // db object
```

Plugins loaded asynchonously, on-demand thus everything in the `Platform` wired together via asynchronous communications.
A `Plugin` itself is also a Platform `Resource`, so you can request access to a plugin's API using same approach.

## Plugins

Following is a plugin package structure. It is not a mandatory, but the structure I tend to use now.

```text
__tests__
__model__
  model.ts
  meta.ts
  strings/*.ts
index.ts // A Plugin's API
plugin.ts // plugin entry point
*.ts  // implementation-related stuff
```

Plugin API defined in `index.ts`. It should not export any code (including internal) and should not have any side effects.
Only API and plugin's PRIs.

Basically, if a plugin depends on another, importing dependant's `index.ts` must be sufficient to start communicating with a plugin.

A `plugin.ts` available to `Platform` only. So you should never import anything from another plugin besides `index.ts`.

Runtime code not allowed to import anything from `__model__` folder. This is solely for tooling/configuration purposes, and does not exists at runtime.