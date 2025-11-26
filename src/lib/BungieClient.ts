import type { BungieHttpProtocol } from "bungie-net-core";
import {
  AllDestinyManifestComponents,
  getDestinyManifestComponent,
} from "bungie-net-core/manifest";
import {
  getActivityHistory,
  getDestinyManifest,
  getLinkedProfiles,
  getProfile,
  getPostGameCarnageReport,
} from "bungie-net-core/endpoints/Destiny2";
import {
  BungieMembershipType,
  DestinyHistoricalStatsPeriodGroup,
  DestinyManifest,
  DestinyPostGameCarnageReportData,
} from "bungie-net-core/models";

const BATCH_SIZE = 50;
const BATCH_DELAY_MS = 750;

export class BungieHttpClient {
  private platformHttp =
    (access_token?: string): BungieHttpProtocol =>
    async (config) => {
      const headers = new Headers({
        "X-API-Key": process.env.NEXT_PUBLIC_BUNGIE_API_KEY!,
      });

      if (access_token) {
        headers.set("Authorization", `Bearer ${access_token}`);
      }

      if (config.contentType) {
        headers.set("Content-Type", config.contentType);
      }

      const url =
        config.baseUrl + (config.searchParams ? `?${config.searchParams}` : "");

      const response = await fetch(url, {
        method: config.method,
        headers,
        body: config.body ? JSON.stringify(config.body) : undefined,
      });

      if (response.headers.get("Content-Type")?.includes("application/json")) {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.Message, {
            cause: data,
          });
        }

        return data;
      } else {
        throw new Error(response.statusText, {
          cause: response,
        });
      }
    };

  private manifestComponentHttp: BungieHttpProtocol = async (config) => {
    const response = await fetch(config.baseUrl, {
      method: config.method,
      body: config.body ? JSON.stringify(config.body) : undefined,
    });

    if (response.headers.get("Content-Type")?.includes("application/json")) {
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message, {
          cause: data,
        });
      }

      return data;
    } else {
      throw new Error(response.statusText, {
        cause: response,
      });
    }
  };

  async getManifest() {
    return await getDestinyManifest(this.platformHttp()).then(
      (res) => res.Response
    );
  }

  async getManifestComponent<T extends keyof AllDestinyManifestComponents>(
    tableName: T,
    destinyManifest: DestinyManifest
  ) {
    return await getDestinyManifestComponent(this.manifestComponentHttp, {
      language: "en",
      tableName,
      destinyManifest,
    });
  }

  async getMembershipData(params: {
    accessToken: string;
    bungieMembershipId: string;
  }) {
    return await getLinkedProfiles(this.platformHttp(params.accessToken), {
      membershipId: params.bungieMembershipId,
      membershipType: -1,
      getAllMemberships: true,
    }).then((res) => res.Response);
  }

  async getBasicProfile(params: {
    accessToken: string;
    destinyMembershipId: string;
    membershipType: BungieMembershipType;
  }) {
    return await getProfile(this.platformHttp(params.accessToken), {
      destinyMembershipId: params.destinyMembershipId,
      membershipType: params.membershipType,
      components: [100, 200],
    }).then((res) => res.Response);
  }

  async getActivityHistory(params: {
    accessToken: string;
    destinyMembershipId: string;
    characterId: string;
    membershipType: BungieMembershipType;
  }) {
    const workerCount = 5;
    const count = 250;

    const getActivitiesForPage = async (page: number) =>
      getActivityHistory(this.platformHttp(params.accessToken), {
        destinyMembershipId: params.destinyMembershipId,
        membershipType: params.membershipType,
        characterId: params.characterId,
        page,
        count,
      }).then((res) => res.Response);

    const pagesGenerator = pageGenerator();

    const workers = Array.from(
      { length: workerCount },
      () =>
        new Promise<DestinyHistoricalStatsPeriodGroup[]>(
          async (resolve, reject) => {
            let hasMore = true;
            const results: DestinyHistoricalStatsPeriodGroup[] = [];

            try {
              while (hasMore) {
                const page = pagesGenerator.next();
                if (page.done) {
                  break;
                }

                const data = await getActivitiesForPage(page.value);

                const inCalendarYear =
                  data.activities?.filter(
                    (a) => new Date(a.period).getFullYear() === 2025
                  ) ?? [];

                // Check if we've hit activities outside 2025 - if so, stop fetching
                const outsideCalendarYear =
                  data.activities?.filter(
                    (a) => new Date(a.period).getFullYear() !== 2025
                  ) ?? [];

                // If we found activities outside 2025, we've reached the boundary
                if (outsideCalendarYear.length > 0) {
                  hasMore = false;
                  results.push(...inCalendarYear);
                  break;
                }

                // Continue fetching as long as we're getting 2025 activities
                hasMore = inCalendarYear.length === count;
                results.push(...inCalendarYear);
              }
            } catch (err) {
              reject(err);
            }

            resolve(results);
          }
        )
    );

    return await Promise.all(workers).then((arrs) =>
      arrs.flat().map((a) => ({ ...a, characterId: params.characterId }))
    );
  }

  async getPostGameCarnageReport(params: {
    accessToken: string;
    activityId: string;
  }): Promise<DestinyPostGameCarnageReportData> {
    return await getPostGameCarnageReport(
      this.platformHttp(params.accessToken),
      {
        activityId: params.activityId,
      }
    ).then((res) => res.Response);
  }

  async getPostGameCarnageReports(params: {
    accessToken: string;
    activityIds: string[];
    onProgress?: (progress: number) => void;
    signal?: AbortSignal;
    onPGCRReceived?: (
      pgcrs: Map<string, DestinyPostGameCarnageReportData>,
      periodMap?: Map<string, string>
    ) => Promise<void> | void;
    periodMap?: Map<string, string>;
  }): Promise<Map<string, DestinyPostGameCarnageReportData>> {
    // Batch mode: 50 requests per second

    const results = new Map<string, DestinyPostGameCarnageReportData>();
    const total = params.activityIds.length;
    let completedCount = 0;

    // Check if cancelled
    const checkCancelled = () => {
      if (params.signal?.aborted) {
        throw new Error("Download cancelled");
      }
    };

    // Process a single request with retry logic
    const processRequest = async (
      activityId: string,
      retryCount = 0,
      maxRetries = 3
    ): Promise<DestinyPostGameCarnageReportData | null> => {
      try {
        checkCancelled();
        const pgcr = await this.getPostGameCarnageReport({
          accessToken: params.accessToken,
          activityId,
        });
        return pgcr;
      } catch (error) {
        // If cancelled, rethrow to stop processing
        if (params.signal?.aborted) {
          throw error;
        }

        // Retry logic: exponential backoff
        if (retryCount < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Max 10 seconds
          console.log(
            `Retrying PGCR ${activityId} (attempt ${
              retryCount + 1
            }/${maxRetries}) after ${delay}ms`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          return processRequest(activityId, retryCount + 1, maxRetries);
        } else {
          // Max retries reached, give up
          console.error(
            `Failed to fetch PGCR for ${activityId} after ${maxRetries} retries:`,
            error
          );
          return null;
        }
      }
    };

    // Process requests in batches
    for (let i = 0; i < params.activityIds.length; i += BATCH_SIZE) {
      try {
        checkCancelled();
      } catch {
        // If cancelled, stop processing
        break;
      }

      const batch = params.activityIds.slice(i, i + BATCH_SIZE);

      // Process batch concurrently - failures won't stop other requests
      const batchPromises = batch.map((activityId) =>
        processRequest(activityId).catch((error) => {
          // Individual request failures are already handled in processRequest
          // This catch ensures Promise.allSettled gets a result even if processRequest throws unexpectedly
          console.error(`Unexpected error processing ${activityId}:`, error);
          return null;
        })
      );

      const batchResults = await Promise.allSettled(batchPromises);

      // Collect successful results for batch storage
      const batchToStore = new Map<string, DestinyPostGameCarnageReportData>();

      for (let index = 0; index < batchResults.length; index++) {
        const result = batchResults[index];
        if (result.status === "fulfilled" && result.value) {
          const activityId = batch[index];
          const pgcr = result.value;
          results.set(activityId, pgcr);
          batchToStore.set(activityId, pgcr);
        }

        // Update progress as each request completes (success or failure)
        completedCount++;
        if (params.onProgress) {
          params.onProgress((completedCount / total) * 100);
        }
      }

      // Store batch of PGCRs - errors here won't stop the download
      if (batchToStore.size > 0 && params.onPGCRReceived) {
        try {
          // Call callback with batch
          await params.onPGCRReceived(batchToStore, params.periodMap);
        } catch (error) {
          console.error(`Failed to store batch of PGCRs:`, error);
          // Continue processing even if storage fails
        }
      }

      // Wait before next batch (unless it's the last batch)
      if (i + BATCH_SIZE < params.activityIds.length) {
        try {
          checkCancelled();
          await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
        } catch {
          // If cancelled during wait, stop processing
          break;
        }
      }
    }

    return results;
  }
}

function* pageGenerator() {
  let page = 0;
  while (true) {
    yield page++;
  }
}
