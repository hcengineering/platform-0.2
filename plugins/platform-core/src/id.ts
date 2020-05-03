//
// Copyright © 2020 Andrey Platov <andrey.v.platov@gmail.com>
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

type Namespace = { [key: string]: { [key: string]: any } }

function transform<N extends Namespace>(prefix: string, namespaces: N, f: (id: string, value: any) => any): N {
  const result = {} as Namespace
  for (const namespace in namespaces) {
    const extensions = namespaces[namespace]
    const transformed = {} as { [key: string]: any }
    for (const key in extensions) {
      transformed[key] = f(prefix + '.' + namespace + '.' + key, extensions[key])
    }
    result[namespace] = transformed
  }
  return result as N
}

const COMPRESS_IDS = false

function compressId(id: string): string {
  if (COMPRESS_IDS) {
    let h = 0
    for (let i = 0; i < id.length; i++)
      h = Math.imul(17, h) + id.charCodeAt(i) | 0

    return Math.abs(h).toString(36)
  }
  return id
}

export default function identify<N extends Namespace>(pluginId: string, namespace: N): N {
  return transform(pluginId, namespace, (id: string, value) => value === '' ? compressId(id) : value)
}
