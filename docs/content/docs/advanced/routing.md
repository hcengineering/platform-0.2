---
title: Routing
menuPosition: 2
---

Here's the routing technics used in platform.

## Basics

Platform accept URI in format  `https://host:port/{path}?{query}#{fragment}` protocol, host and port are handled by browser itself, so we had accessed to:

* {*path*} - a list of segments delimited by '**/**'.
* {*query*} - a map of key=value pairs between **?** and **#** (or end of URI) delimited by '**&**'
* {*fragment*} - any string representing fragment after **#** of URI.

## Basic Routing.

Platform had few useful APIs to subscribe for a structured browser location or use a type safe routing chain. 
It is still possible to use raw browser location, so no restrictions, but we think structured approach is a way better.

### Browser Location and navigation.

As first step to typed/structured routing platform had a *Location* interface to represent its logical structure.
It could be used for basic routing and parameter matching, it is a simple step from a pure URI string representation and in compere to full URI it has no information about host, port or protocol. All of this are browser responsibility and we do not think about them in platform application navigation.

```typescript
export interface Location {
  path: string[] // A useful path value
  query: Record<string, string | null> // a value of query parameters, no duplication are supported
  fragment: string // a value of fragment
}
```

To start use a current *Location*  we should retrieve a '@anticrm/platform-ui' plugin and take it's `UIService`.
Following API calls are usefull with a `Location`:

* subscribeLocation - subscribe for a location, pass a handler to be informed about location changes. Will be triggered on subscribe as well.
* navigateJoin - navigate with replace some of current location parts, like path, or some particular query or fragment.
* navigate - navigate with replace current Location with new uri.

## Routing component chain.

Alternative to parsed Location Platform has a typed ApplicationRouter<T> implemenation with a pattern based router to match Location patameetrs to passed interface fields. It could be constructed using`UIService.newRouter<T>(pattern, matcher)  `call, or using global `newRouter(pattern, matcher)` call. Following calls are available only from inside Svelte components since they use current context and set a newly created router into context to make a chain of router.

A general idea of routing with using ApplicationRouter is to specify a `pattern` with format `{segmentAttr}/../{segmentAttrN}?{queryAttr1}&..&{queryAttrN}#{fragmentAttr}` and a typescript interface to assign this matched values to.

So every router will take a list of segments and take some query values and fragment, and if URI is have more information it will be passed to next chain of routers. So components will work with structured information of required parameters or their default values.

Since routers are always had current set of values and hold information of previous and next ones, we are capable to reconstruct a full URI if we want to change some of attributes. It is become type safe and easy to use approach.

Following diagram shows an example of how it works: 
Every router will cut part of matched parameters and pass to next chained router.

{{< mermaid >}}
sequenceDiagram
    Browser ->> +C1: URI
    Note right of C1: pattern1
    C1 ->>+ C1: extract patterns from URI
    Note right of C2: pattern2
    C1 ->> C2: URI without args of C1
    C2 ->> C3: URI without args of C2      
{{< /mermaid >}}

## Platform default routing

Platform has a top level component Root.svelte defailed with a initial component application routing. It accepts fiest path segment and retrieve a metadata object with pattern 'routes:{name}', so if some of plugins are define such metadat with type 

```typescript
/**
 * Define a useful route to applications.
 */
export interface ApplicationRoute {
  route: string
  component: AnyComponent
}
```

It will be used to constuct a top level Svelte componend based on it.

Examle of how top level component routing could be used:

```typescript
platform.setMetadata(routeMeta('login'), {
		route: 'login', 
  	component: login.component.LoginForm 
})
```

Following line will define a top level application component named login. So every URI '/login' will go to LoginForm component.

## Workbench routing

Workbench is a default extensible application defined for platform, it integrate all other plugin extensions to usable user exprience. It support a wide range of extensions, here we will talk only on basic routing used for Workbench top level component.

```typescript
platform.setMetadata(routeMeta('workbench'), {
  	route: 'workbench', 
  	component: workbench.component.Workbench 
})
```

As we see `/workbench/` URI is used to go for Workbench component.

Let's see how workbench is routing through it's parts:

{{< mermaid >}}
sequenceDiagram
    Browser ->> +Root: /workbench/default/GEN/tasks?browse=GEN-20&filter=A
    Note right of Root: pattern: /{application}
    Root ->>+ Root: extract 'workbench' as application
    Note right of Workbench: {perspective}/{space}/{app}?{browse}
    Root ->> Workbench: /default/GEN/tasks?browse=GEN-20&filter=A
    Workbench ->> Workbench: extract 'default' as perspective
    Workbench ->> DefaultPerspective: /GEN/tasks?browse=GEN-20&filter=A
    DefaultPerspective ->> DefaultPerspective: extract 'GEN' as space
    DefaultPerspective ->> DefaultPerspective: extract 'tasks' as app
    DefaultPerspective ->> DefaultPerspective: extract 'GEN-20' as browse   
    Note right of Application: ?filter
    DefaultPerspective ->> Application: ?filter=A
    Application ->> Application: extract 'A' as filter                
{{< /mermaid >}}

So as we could see Workbench has first level extension named Perspective, by default Platform had DefaultPerspective implementation defined. But plugins could provide more.

```typescript
export interface Perspective extends Doc {
  name: string // A uniq short name
  label: IntlString
  icon?: Asset
  component: AnyComponent
}
```

Workbench will support perspective switching on the fly to provide more detailed and specialized representation of customer data for special needs.

Default perspective implementation support concept of `application`, accept current`space` and had `doc` query parameter  to identify focused document object.

## Application routing

Any application component could also benefit from using ApplicationRouter<T> by defining its parameters as typescript interface and construct a router inside Svelte component as on example:


```typescript
import { newRouter } from '@anticrm/platform-ui' 
interface MyRouteParameters {
  filter: string
  objId: string
  sorting: string
  order: string
}
const router = newRouter()<MyRouteParameters>('{filter}/{objId}?{sorting}&{order}', (match)=> {
	// match will be interface MyRouteParameters with
}, {order: '#none', sorting:'ABC', filter="all-issues", objId:'#none'})

````

So after router is constructed on every URI change its matching function will be called with a new matched values as interface passed to router constructor. Also it is possible to pass default values, so it will be pretty easy to write less code.



### Router life cycle

After we construct router it will be registered to Svelte context, so any child component could re-use it for passing parameters, but be aware to construct a direct line of router chains, since it will work only for one parent to child chain of routers.



### Navigete using constructed router

Naviget is quite simple, just call

```typescript
router.navigate({filter:'my-new-filter'})
```

And it will update current browser history with a new URI with filter value replaced and call match function to update our needs.



## Full ApplicationRouter documentation

A full *ApplicationRouter<T>* interface could be checked in API section of this documentation.