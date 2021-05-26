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

import core, { Attribute, Class, ClassifierKind, CollectionOf, Doc, Emb, Enum, EnumLiteral, EnumOf, InstanceOf, Obj, Ref, RefTo, Type } from '@anticrm/core'
import { exit } from 'process'
import * as ts from 'typescript'

const opt: ts.CompilerOptions = {
  noEmitOnError: true,
  noImplicitAny: true,
  outDir: './lib',
  experimentalDecorators: true,
  emitDecoratorMetadata: true,
  target: ts.ScriptTarget.ESNext,
  module: ts.ModuleKind.CommonJS
}

export interface Collector {
  buildClass: (_kind: ClassifierKind, nodeId: string, _id: Ref<Class<Obj>>, _base: Class<Obj>, collectedIds: { [key: string]: Ref<Doc>}) => Class<Obj>
  buildEnum: (nodeId: string, _id: Ref<Class<Obj>>) => Enum<any>
  sourceId: (key: string) => string // resource source id for a local object name
}

export function collectModel (_fileName: string): Collector {
  const createdFiles: {[key: string]: string} = {}
  const host = ts.createCompilerHost(opt, true)
  host.writeFile = (fileName: string, data: string, writeByteOrderMark: boolean, onError?: (message: string) => void, sourceFiles?: readonly ts.SourceFile[]) => {
    createdFiles[fileName] = data
  }

  const program = ts.createProgram([_fileName], opt, host)
  const emitResult = program.emit()

  if (emitResult.diagnostics.length !== 0) {
    console.error('Please fix compiler errors')
    const allDiagnostics = ts
      .getPreEmitDiagnostics(program)
      .concat(emitResult.diagnostics)

    allDiagnostics.forEach(diagnostic => {
      if (diagnostic.file !== undefined) {
        const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start ?? 0)
        const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
        console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`)
      } else {
        console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
      }
    })
  }

  /** True if this is visible outside this file, false otherwise */
  function isNodeExported (node: ts.Node): boolean {
    return (
      (ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export) !== 0 ||
    (node.parent != null && node.parent.kind === ts.SyntaxKind.SourceFile)
    )
  }

  const modelSource = program.getSourceFile(_fileName)
  if (modelSource === undefined) {
    console.error('model source is not defined.')
    exit(1)
  }

  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })

  interface NamedDeclaration {
    name: string
    qname: string
    node: ts.Node
  }

  function processModuleItems (module: ts.SourceFile): Record<string, NamedDeclaration> {
    const importedObjects: Record<string, NamedDeclaration> = {}
    const resolvedModules: ts.ESMap<string, ts.ResolvedModuleFull> | undefined = (module as any).resolvedModules
    if (resolvedModules === undefined) {
    // There is no imports
      return importedObjects
    }
    ts.forEachChild(module, (node) => {
      if (ts.isImportDeclaration(node)) {
        if (ts.isStringLiteralLike(node.moduleSpecifier)) {
          const importModuleName = node.moduleSpecifier.text
          if (importModuleName !== undefined) {
            const resolvedModuleRef = resolvedModules.get(importModuleName)
            if (resolvedModuleRef === undefined) {
              throw new Error(`failed to resolve module: ${importModuleName} `)
            }
            const resolvedModule = program.getSourceFile(resolvedModuleRef.resolvedFileName)
            if (resolvedModule === undefined) {
              throw new Error(`failed to resolve module: ${importModuleName} `)
            }
            const exports = processModuleExports(resolvedModule)
            const bindings = node.importClause?.namedBindings
            if (bindings !== undefined) {
              if (ts.isNamedImports(bindings)) {
                for (const o of bindings.elements) {
                  const eid = (o.propertyName?.escapedText as string) ?? o.name.text
                  const expItem = exports.exports[eid]
                  if (expItem !== undefined) {
                    importedObjects[o.name.text] = expItem
                  }
                }
              }
              if (ts.isNamespaceImport(bindings)) {
                throw new Error('namespace imports are not yet supported.')
              }
            } else {
              for (const kv of Object.entries(exports.exports)) {
                importedObjects[kv[0]] = kv[1]
              }
            }
          }
        }
      }
      if (ts.isNamespaceImport(node)) {
        throw new Error('namespace imports are not supported')
      }
      if (ts.isNamedImports(node)) {
        throw new Error('named imports are not supported')
      }
    })
    moduleImports[module.fileName] = importedObjects
    return importedObjects
  }

  /**
 * Go over current module imports and collect all exported symbols.
 */
  function processModuleExports (module: ts.SourceFile): {exports: {[key: string]: NamedDeclaration}, module: {[key: string]: NamedDeclaration} } {
    const exportedObjects: {[key: string]: NamedDeclaration} = {}
    const modelObjects: {[key: string]: NamedDeclaration} = {}
    const resolvedModules: ts.ESMap<string, ts.ResolvedModuleFull> | undefined = (module as any).resolvedModules

    function processExportCause (node: ts.ExportDeclaration, findExport: (name: string) => NamedDeclaration | undefined): void {
      if (node.exportClause !== undefined) {
        if (ts.isNamedExports(node.exportClause)) {
          for (const ec of node.exportClause.elements) {
          // Re export name.
            const eName = ec.name.text
            const namedExport = findExport(eName)
            if (namedExport !== undefined) {
              exportedObjects[ec.propertyName?.text ?? ec.name.text] = namedExport
            }
          }
        } else if (ts.isNamespaceExport(node.exportClause)) {
          const ss = printer.printNode(ts.EmitHint.Unspecified, node, module)
          console.error('non supported namespace export cause:' + ss)
        }
      }
    }

    ts.forEachChild(module, (node) => {
      const ss = printer.printNode(ts.EmitHint.Unspecified, node, module)
      if (ts.isExportDeclaration(node)) {
        if (node.moduleSpecifier !== undefined && ts.isStringTextContainingNode(node.moduleSpecifier)) {
          const moduleName = node.moduleSpecifier.text
          const module = resolvedModules?.get(moduleName)
          if (module === undefined) {
            throw new Error('failed to find resolved module ' + moduleName)
          }
          const exportModule = program.getSourceFile(module.resolvedFileName)
          if (exportModule === undefined) {
            throw new Error('failed to find resolved module ' + moduleName)
          }
          const allExports = processModuleExports(exportModule)
          // Filter exports by exportClause

          if (node.exportClause !== undefined) {
            if (ts.isNamespaceExport(node.exportClause)) {
              console.error('non supported namespace export cause:' + ss)
            } else {
              processExportCause(node, (eName) => allExports.exports[eName])
            }
          } else {
          // Re export all names
            for (const kv of Object.entries(allExports.exports)) {
              exportedObjects[kv[0]] = kv[1]
            }
          }
        } else {
        // This is export from our current module
          processExportCause(node, (eName) => modelObjects[eName] ?? exportedObjects[eName])
        }
      }
      if (ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isEnumDeclaration(node)) {
        const declName = node.name?.escapedText as string
        if (declName === undefined) {
          console.log('skipping unnamed class declaration: ' + ss)
        }
        const qname = module.fileName + '.' + declName
        const decl = { qname, node, name: declName }
        modelObjects[declName] = decl
        if (isNodeExported(node)) {
          exportedObjects[declName] = decl
        }
      }
    })
    return { exports: exportedObjects, module: modelObjects }
  }

  const moduleImports: { [key: string]: Record<string, NamedDeclaration> } = {}

  const importedObjects = processModuleItems(modelSource)

  function getRealId (mImports: Record<string, NamedDeclaration>, moduleLocals: {[key: string]: NamedDeclaration}, collectedIds: { [key: string]: Ref<Doc>}, name?: string): Ref<Doc> | undefined {
    if (name === undefined) {
      throw new Error('failed to resolve real id')
    }
    const localRef = moduleLocals[name] ?? mImports[name]
    if (localRef === undefined) {
      return undefined
    }

    return collectedIds[localRef.qname]
  }

  function extractType (module: ts.SourceFile, collectedIds: { [key: string]: Ref<Doc>}, type?: ts.TypeNode): Type {
    const mImports = moduleImports[module.fileName] ?? processModuleItems(module)
    const moduleLocals = processModuleExports(module).module

    if (type === undefined) {
      return {
        _class: core.class.Type
      }
    }
    if (ts.isTypeReferenceNode(type)) {
      const typeName = type.typeName.getText()
      switch (typeName) {
        case 'Ref': {
          // Find a reference type, it should be imported in current scope
          const ta = type.typeArguments?.[0]
          let tName = ta?.getText()
          if (ta !== undefined && ts.isTypeReferenceNode(ta)) {
            tName = ta.typeName.getText()
          }
          const realId = getRealId(mImports, moduleLocals, collectedIds, tName)
          if (realId === undefined) {
            throw new Error('failed to find a reference id')
          }
          const colT: RefTo<Doc> = {
            _class: core.class.RefTo,
            to: realId as Ref<Class<Obj>>
          }
          return colT
        }
        case 'Collection': {
          // Find a reference type, it should be imported in current scope
          const realId = getRealId(mImports, moduleLocals, collectedIds, type.typeArguments?.[0].getText())
          if (realId === undefined) {
            throw new Error('failed to find a reference id')
          }
          const colT: CollectionOf<Emb> = {
            _class: core.class.CollectionOf,
            of: realId as Ref<Class<Obj>>
          }

          return colT
        }
        case 'Array': {
          const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })
          const ss = printer.printNode(ts.EmitHint.Unspecified, type, type.getSourceFile())
          console.warn(`Detected Array attribute: ${ss}`)
          break
        }
        default: {
          // Check it reference to some local object, to make instance of or EnumOf.
          const localRef = moduleLocals[typeName] ?? mImports[typeName]
          if (localRef !== undefined) {
            // Local reference type
            if (ts.isEnumDeclaration(localRef.node)) {
              // This is enum reference
              const enumId = collectedIds[localRef.qname]
              if (enumId === undefined) {
                throw new Error(`failed to find enum id ${localRef.name} from ${localRef.node.getSourceFile().fileName}`)
              }
              const enumOf: EnumOf = {
                _class: core.class.EnumOf,
                of: enumId as Ref<Enum<any>>
              }
              return enumOf
            }
            if (ts.isInterfaceDeclaration(localRef.node)) {
              // This is embedded object
              const typeId = collectedIds[localRef.qname]
              if (typeId === undefined) {
                console.warn(`failed to find object id ${localRef.name} from ${localRef.node.getSourceFile().fileName}`)
              } else {
                const instanceOf: InstanceOf<Emb> = {
                  _class: core.class.InstanceOf,
                  of: typeId as Ref<Class<Emb>>
                }
                return instanceOf
              }
            }
          }
        }
      }
    }
    switch (type.kind) {
      case ts.SyntaxKind.StringKeyword:
        return {
          _class: core.class.String
        }
      case ts.SyntaxKind.BooleanKeyword:
        return {
          _class: core.class.Boolean
        }
      case ts.SyntaxKind.NumberKeyword:
        return {
          _class: core.class.Number
        }
      case ts.SyntaxKind.AnyKeyword:
        return {
          _class: core.class.Any
        }
    }
    return {
      _class: core.class.Type
    }
  }
  function buildClass <T extends Obj> (_kind: ClassifierKind, nodeId: string, _id: Ref<Class<T>>, _base: Class<Obj>, collectedIds: { [key: string]: Ref<Doc>}): Class<Obj> {
    const cl: Class<Obj> = {
      ..._base,
      _class: _kind === ClassifierKind.CLASS ? core.class.Class : core.class.Mixin,
      _id,
      _extends: _id === _base._extends ? undefined : _base._extends,
      _attributes: _base._attributes ?? { items: [] },
      _kind
    }

    const node = importedObjects[nodeId]?.node
    if (cl._extends !== undefined && node === undefined) {
      // if Extends is defined and there is no real node imported with such name we assume it is a dummy class extending specified
      return cl
    }

    if (node === undefined) {
      throw new Error('failed to find node for ' + _id)
    }

    const module = node.getSourceFile()
    const mImports = moduleImports[module.fileName] ?? processModuleItems(module)
    const moduleLocals = processModuleExports(module).module

    // We need to obtain parent class and check for method overrides.
    // Process members
    if (ts.isInterfaceDeclaration(node)) {
      const members: ts.TypeElement[] = []
      members.push(...node.members)

      const existingAttributes: {[key: string]: string } = {}

      if (node.heritageClauses !== undefined) {
        for (const hclause of node.heritageClauses) {
          for (const hct of hclause.types) {
            if (ts.isExpressionWithTypeArguments(hct)) {
              if (ts.isIdentifier(hct.expression)) {
                const hctName = hct.expression.escapedText as string
                const localRef = moduleLocals[hctName] ?? mImports[hctName]
                if (localRef === undefined) {
                  throw new Error(`failed to find an extends declaration ${hctName}`)
                }
                const realId = collectedIds[localRef.qname]
                const intNode = localRef.node
                if (ts.isInterfaceDeclaration(intNode)) {
                  if (realId !== undefined) {
                  // We have a base class definition.
                    if (cl._extends === undefined) { // Specify a base class
                      cl._extends = realId as Ref<Class<Obj>>
                    }
                    for (const m of intNode.members) {
                      if (m.name !== undefined) {
                        const name = m.name.getText()

                        if (ts.isPropertySignature(m)) {
                          existingAttributes[name] = realId
                        }
                      }
                    }
                  } else {
                  // Nope just interface definition, we should aggregate members.
                    members.push(...intNode.members)
                  }
                }
              }
            }
          }
        }
      }

      for (const m of members) {
        if (m.name !== undefined) {
          const name = m.name.getText()

          if (ts.isPropertySignature(m)) {
            const attrType = extractType(node.getSourceFile(), collectedIds, m.type)

            // Check we we already had such attribute defined.
            const existingAttr = existingAttributes[name]
            if (existingAttr !== undefined) {
              // Skipt existing argument
              continue
            }

            const attr: Attribute = {
              name,
              _id: (_id + '.' + name) as Ref<Attribute>,
              _class: core.class.Attribute,
              type: attrType
            }

            cl._attributes?.items?.push(attr)
          } else {
            const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })
            const ss = printer.printNode(ts.EmitHint.Unspecified, node, node.getSourceFile())
            throw new Error(`unsupported declaration '${ss}'`)
          }
        }
      }
    }
    return cl
  }
  function buildEnum (nodeId: string, _id: Ref<Class<Obj>>): Enum<any> {
    const en: Enum<any> = {
      _class: core.class.Enum,
      _id,
      _literals: { items: [] },
      _kind: ClassifierKind.ENUM
    }

    const node = importedObjects[nodeId]?.node
    if (node === undefined) {
      throw new Error('failed to find node for ' + _id)
    }

    if (ts.isEnumDeclaration(node)) {
      let ordinal = 0

      for (const m of node.members) {
        if (m.name !== undefined) {
          const label = m.name.getText()

          if (ts.isEnumMember(m)) {
            // Check we we already had such attribute defined.
            const attr: EnumLiteral = {
              label,
              ordinal,
              _id: (_id + '.' + label) as Ref<Attribute>,
              _class: core.class.EnumLiteral
            }

            if (m.initializer !== undefined) {
              const mini = m.initializer
              if (ts.isNumericLiteral(mini)) {
                ordinal = parseInt(mini.getText())
                attr.ordinal = ordinal
              } else if (ts.isStringLiteralLike(mini)) {
                attr.ordinal = mini.text
              }
            }

            en._literals?.items?.push(attr)
            ordinal++
          } else {
            const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })
            const ss = printer.printNode(ts.EmitHint.Unspecified, node, node.getSourceFile())
            throw new Error(`unsupported declaration '${ss}'`)
          }
        }
      }
    }

    return en
  }

  return {
    importedObjects,
    buildClass,
    buildEnum,
    sourceId: (key: string) => {
      const o = importedObjects[key]
      if (o !== undefined) {
        return o.qname
      }
      throw new Error(`failed to locale classifier for ${key}`)
    }
  } as unknown as Collector
}
