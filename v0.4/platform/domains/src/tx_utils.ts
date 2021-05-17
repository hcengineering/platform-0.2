import { Tx, TxContext } from '@anticrm/core'
import domains, { AddItemTx, CreateTx, DeleteTx, RemoveItemTx, UpdateItemTx, UpdateTx } from '.'

export interface TxOperations {
  onCreateTx: (ctx: TxContext, tx: CreateTx) => Promise<any>
  onUpdateTx: (ctx: TxContext, tx: UpdateTx) => Promise<any>
  onDeleteTx: (ctx: TxContext, tx: DeleteTx) => Promise<any>

  onAddItemTx: (ctx: TxContext, tx: AddItemTx) => Promise<any>
  onUpdateItemTx: (ctx: TxContext, tx: UpdateItemTx) => Promise<any>
  onRemoveItemTx: (ctx: TxContext, tx: RemoveItemTx) => Promise<any>
}

export async function processTransactions (ctx: TxContext, tx: Tx, txop: TxOperations): Promise<any> {
  switch (tx._class) {
    case domains.class.CreateTx:
      return await txop.onCreateTx(ctx, tx as CreateTx)
    case domains.class.UpdateTx:
      return await txop.onUpdateTx(ctx, tx as UpdateTx)
    case domains.class.DeleteTx:
      return await txop.onDeleteTx(ctx, tx as DeleteTx)
    case domains.class.AddItemTx:
      return await txop.onAddItemTx(ctx, tx as AddItemTx)
    case domains.class.UpdateItemTx:
      return await txop.onUpdateItemTx(ctx, tx as UpdateItemTx)
    case domains.class.RemoveItemTx:
      return await txop.onRemoveItemTx(ctx, tx as RemoveItemTx)
    default:
      console.log('not implemented text tx', tx)
  }
}
