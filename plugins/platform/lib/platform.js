"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.identify = exports.Platform = void 0;
class Platform {
    constructor() {
        this.COMPRESS_IDS = false;
        // P L A T F O R M  R E S O U R C E  I D E N T I F I E R S
        this.providers = new Map();
        this.resolvedProviders = new Map();
        // P L U G I N S
        this.plugins = new Map();
        this.locations = [];
        // M E T A D A T A
        this.metadata = new Map();
    }
    compressId(id) {
        if (this.COMPRESS_IDS) {
            let h = 0;
            for (let i = 0; i < id.length; i++)
                h = Math.imul(17, h) + id.charCodeAt(i) | 0;
            return Math.abs(h).toString(36);
        }
        return id;
    }
    resolve(resource) {
        const kind = resource.substring(0, resource.indexOf(':'));
        let provider = this.resolvedProviders.get(kind);
        if (!provider) {
            const resourcePlugin = this.providers.get(kind);
            if (!resourcePlugin)
                throw new Error('no provider associated with resource kind: ' + kind);
            provider = this.getPlugin(resourcePlugin);
            this.resolvedProviders.set(kind, provider);
        }
        return provider.then(plugin => plugin.resolve(resource));
    }
    getLocation(id) {
        for (const location of this.locations) {
            if (location[0].id === id)
                return location;
        }
        throw new Error('no descriptor for: ' + id);
    }
    addLocation(plugin, module) {
        this.locations.push([plugin, module]);
    }
    async getPlugin(id) {
        const plugin = this.plugins.get(id);
        if (plugin) {
            return plugin;
        }
        else {
            const location = this.getLocation(id);
            const deps = await this.resolveDependencies(location[0].deps);
            const module = location[1];
            const plugin = module().then(module => module.default).then(f => f(this, deps));
            this.plugins.set(id, plugin);
            return plugin;
        }
    }
    // D E P E N D E N C I E S
    async resolveDependencies(deps) {
        const result = {};
        for (const key in deps) {
            const id = deps[key];
            result[key] = await this.getPlugin(id);
        }
        return result;
    }
    getMetadata(id) {
        return this.metadata.get(id);
    }
    setMetadata(id, value) {
        this.metadata.set(id, value);
    }
    loadMetadata(ids, resources) {
        for (const key in ids) {
            const id = ids[key];
            const resource = resources[key];
            if (!resource) {
                throw new Error(`no resource provided, key: ${key}, id: ${id}`);
            }
            this.metadata.set(id, resource);
        }
    }
}
exports.Platform = Platform;
function transform(plugin, namespaces, f) {
    const result = {};
    for (const namespace in namespaces) {
        const extensions = namespaces[namespace];
        const transformed = {};
        for (const key in extensions) {
            transformed[key] = f(namespace + ':' + plugin + '.' + key, extensions[key]);
        }
        result[namespace] = transformed;
    }
    return result;
}
function identify(pluginId, namespace) {
    return transform(pluginId, namespace, (id, value) => value === '' ? id : value);
}
exports.identify = identify;
function plugin(id, deps, namespace) {
    return { id, deps, ...identify(id, namespace) };
}
exports.plugin = plugin;
