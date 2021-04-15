           ---
title: Mixins
menuPosition: 1
draft: true
---

# How to get mixins

Mixin is a class that contains methods
for use by other classes without having
to be the parent class of those other classes.

Any real object that contains mixins would have an array
that represents mixin classes and properties that mixed into:

```js
{
    ...
    _mixins: [
      'mixin:core.ShortID'
    ],
    'shortId|mixin:core~ShortID': 'shortIdValue'
}
```
As shown above the mixed property contains both
property key and the mixin itself, so you can access
a mixin anywhere anytime.

For easier interruption with mixins you can use some
methods provided by `core` package.
Global `mixinFromKey` and `mixinKey` methods will help you
to convert the mixed property name to needed values.

Also, you can use `GetAllMixins` method provided by
model from `coreService`:
```js
getCoreService()
    .then(coreService => coreService.getModel())
    .then(model => model.getAllMixins(fromTheLayout))
    .then(mixins => /* ... */)
```

If you need to interact with a document as a mixin,
you can use the `as` or methods provided by model:

```js
getCoreService()
    .then(coreService => coreService.getModel())
    .then(model => model.as(document, _mixin))
    .then(mixinProxy => /* ... */)
```
