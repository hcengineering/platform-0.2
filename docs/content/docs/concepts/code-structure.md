---
title: Code Structure
menuPosition: 2
---

Here's the breakdown of the repo:

## Packages
* [@anticrm/foundation](/apis/foundation) -- Anticrm Platform Foundation Types.
* [@anticrm/platform](/apis/platform) -- Plugin architecture and implementation. Client-side only.
* [@anticrm/core](/apis/core) -- Core concepts shared by Client plugins and Server components.
* [@anticrm/model](/apis/model) -- Utils to define and manage domain models. Used by tooling, not a part of client/server runtimes.

File Dependencies:

{{< mermaid >}}

graph BT
    platform/index --> foundation/index
    core/objectid --> core/classes
    core/rpc --> foundation/index
    core/space --> core/classes
    core/text --> core/classes & core/tx & core/objectid & core/model
    core/title --> core/classes & core/tx & core/objectid & core/model
    core/vdoc --> core/classes & core/tx & core/objectid & core/model
    core/tx --> core/model & core/classes
    core/model --> core/classes & core/tx
    core/textmodel
    core/utils --> core/classes & core/tx

{{< /mermaid >}}

