# The Platform

Any Platform application is nothing but a set of installed `plugins`. 
At the very core `Platform` is a simple piece of code, which connects plugins together.

## Plugins

Plugin is an *isolated* piece of software, and a plugin never directly `import` stuff from other plugins 
(in sense of JavaScript `import` statement). Every plugin provide `Resources` to another plugins via
`Platform` runtime. Resources are accessible via a kind of PRI (Platform Resource Identifier).

Resource can be anything meaningful: an object in the database, `Vue` component, an asset URL, etc. 
For any `resource` there is a known `plugin`, which can *resolve* resource identifier into actual meaningful object.

### Why we need `Resources`?

Platform persists `Platform objects` in the database. Platform objects uniquely identified and belongs to a `Class`. Any platform object may have properties, which can be:

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

### Plugin package structure

Following is not a mandatory. In the meantime I tend to use following package structure for each Plugin.

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
