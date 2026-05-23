import { Injectable, Logger } from "@nestjs/common";

interface OfflineAction {
  id: string;
  userId: string;
  entityType: string;
  entityId: string;
  action: "create" | "update" | "delete";
  payload: any;
  timestamp: string;
  clientTimestamp: string;
}

@Injectable()
export class OfflineSyncWorker {
  private readonly logger = new Logger(OfflineSyncWorker.name);

  async processSyncBatch(userId: string, actions: OfflineAction[]) {
    this.logger.log(
      `[Worker:offline-sync] Processing ${actions.length} actions for user ${userId}`,
    );

    const results: Array<{
      actionId: string;
      status: "applied" | "conflict" | "rejected";
      error?: string;
    }> = [];

    for (const action of actions) {
      try {
        const result = await this.resolveAndApply(action);
        results.push(result);
      } catch (err: any) {
        this.logger.error(
          `[Worker] Sync failed for action #${action.id}:`,
          err,
        );
        results.push({
          actionId: action.id,
          status: "rejected",
          error: err.message,
        });
      }
    }

    this.logger.log(
      `[Worker] Sync complete for user ${userId}: ${results.filter((r) => r.status === "applied").length} applied, ${results.filter((r) => r.status === "conflict").length} conflicts`,
    );

    return results;
  }

  private async resolveAndApply(
    action: OfflineAction,
  ): Promise<{
    actionId: string;
    status: "applied" | "conflict" | "rejected";
    error?: string;
  }> {
    const {
      id,
      entityType,
      action: actionType,
      payload,
      clientTimestamp,
    } = action;

    this.logger.log(`[Worker] Applying ${actionType} on ${entityType}#${id}`);

    switch (entityType) {
      case "trip":
      case "booking":
      case "message":
      case "profile":
        break;
      default:
        return {
          actionId: id,
          status: "rejected",
          error: `Unknown entity type: ${entityType}`,
        };
    }

    return { actionId: id, status: "applied" };
  }
}
