import core, { Class$, Prop, ArrayOf$, Builder, InstanceOf$, Primary, MODEL_DOMAIN } from '..'
import { Ref, Doc, Emb, Class } from '@anticrm/core'
import { TDoc, TEmb, TObj } from '../__model__'

export interface TaskComment extends Emb {
  _id: string
  message: string
  author: string
  date: Date
  oldVersion: TaskComment[]
}

export interface SubTask extends Emb {
  name: string
  rate?: number
  comments?: TaskComment[]
}

export interface Task extends Doc {
  name: string
  description: string
  lists: string[]
  tasks?: SubTask[]
  mainTask?: SubTask
  rate?: number
  comments?: TaskComment[]
}

export const taskIds = {
  class: {
    Task: 'core.class.TaskObj' as Ref<Class<Task>>,
    Subtask: 'core.class.SubTask' as Ref<Class<SubTask>>,
    TaskComment: 'core.class.TaskComment' as Ref<Class<TaskComment>>
  }
}

export function createSubtask (name: string, rate = 30): SubTask {
  return {
    name: name,
    rate: rate,
    __embedded: true,
    _class: taskIds.class.Subtask
  } as SubTask
}

export const doc1 = {
  _id: 'd1' as Ref<Doc>,
  _class: taskIds.class.Task,
  name: 'my-space',
  description: 'some-value',
  lists: ['val1', 'val2'],
  rate: 20,
  mainTask: createSubtask('main-subtask', 30),
  tasks: [
    createSubtask('subtask1', 31),
    createSubtask('subtask2', 33)
  ]
} as Task

@Class$(taskIds.class.Task, core.class.Doc, MODEL_DOMAIN)
export class TTask extends TDoc implements Task {
  @Primary()
  @Prop() name!: string
  @Prop() description!: string

  @Prop() rate!: number

  @Prop() lists!: string[]

  @InstanceOf$(taskIds.class.Subtask) mainTask!: SubTask

  @ArrayOf$()
  @InstanceOf$(taskIds.class.Subtask)
  tasks?: SubTask[]

  @ArrayOf$()
  @InstanceOf$(taskIds.class.TaskComment)
  comments?: TaskComment[]
}

@Class$(taskIds.class.Subtask, core.class.Emb, MODEL_DOMAIN)
export class TSubTask extends TEmb implements SubTask {
  @Prop() name!: string
  @Prop() rate!: number

  @ArrayOf$()
  @InstanceOf$(taskIds.class.TaskComment)
  comments?: TaskComment[]
}

@Class$(taskIds.class.TaskComment, core.class.Emb, MODEL_DOMAIN)
export class TTaskComment extends TEmb implements TaskComment {
  @Prop()
  _id!: string

  @Prop()
  message!: string

  @Prop()
  author!: string

  @Prop()
  date!: Date

  @ArrayOf$()
  @InstanceOf$(taskIds.class.TaskComment)
  oldVersion!: TaskComment[]
}

export function model (S: Builder): void {
  S.add(TTask, TSubTask, TTaskComment)
}

export function fullModel (S: Builder): void {
  S.add(TObj, TEmb, TDoc)
  model(S)
}
