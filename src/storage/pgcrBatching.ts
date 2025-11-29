import { DestinyPostGameCarnageReportData } from "bungie-net-core/models";

const BATCH_SIZE = 100;

/**
 * Batches streamed PGCRs for storage.
 * Accumulates individual PGCRs into batches and calls the callback when batch size is reached.
 * Batches are processed sequentially (one at a time) since await is used on the callback.
 */
export async function batchStreamedPGCRs(
  stream: AsyncGenerator<
    {
      pgcr: DestinyPostGameCarnageReportData;
    },
    void,
    unknown
  >,
  onBatchCompleted: (
    pgcrs: Map<string, DestinyPostGameCarnageReportData>
  ) => Promise<void> | void
): Promise<Map<string, DestinyPostGameCarnageReportData>> {
  const results = new Map<string, DestinyPostGameCarnageReportData>();
  const storageBatch = new Map<string, DestinyPostGameCarnageReportData>();

  try {
    for await (const { pgcr } of stream) {
      // Accumulate individual result
      const id = pgcr.activityDetails.instanceId;
      results.set(id, pgcr);
      storageBatch.set(id, pgcr);

      // When batch reaches size, store it sequentially
      if (storageBatch.size >= BATCH_SIZE) {
        try {
          // Create a copy of the batch to store
          const batchToStore = new Map(storageBatch);

          // Process this batch and track the promise
          await onBatchCompleted(batchToStore);

          // Clear the batch after successful storage
          storageBatch.clear();
        } catch (error) {
          console.error(`Failed to store batch of PGCRs:`, error);
          // Continue processing even if storage fails
          // Don't clear the batch so it can be retried or stored later
        }
      }
    }

    // Store any remaining PGCRs in the final batch
    if (storageBatch.size) {
      try {
        await onBatchCompleted(storageBatch);
      } catch (error) {
        console.error(`Failed to store final batch of PGCRs:`, error);
        // Continue even if storage fails
      }
    }
  } catch (error) {
    // Re-throw cancellation errors
    if (error instanceof Error && error.message === "Download cancelled") {
      throw error;
    }
    // For other errors, return what we have so far
    console.error("Error during PGCR batching:", error);
  }

  return results;
}
