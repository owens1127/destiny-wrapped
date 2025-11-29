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

const MAX_CONCURRENT_REQUESTS = 20;

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

  /**
   * Stream PGCRs individually as they complete.
   * Yields each individual PGCR as it arrives, allowing for real-time processing.
   * All requests are processed with rate limiting (50 per second).
   */
  async *getPostGameCarnageReportsStream(params: {
    accessToken: string;
    activityIds: Set<string>;
    signal?: AbortSignal;
  }): AsyncGenerator<
    {
      activityId: string;
      pgcr: DestinyPostGameCarnageReportData;
      progress: number;
      completed: number;
      total: number;
    },
    void,
    unknown
  > {
    const total = params.activityIds.size;
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
    ): Promise<{
      activityId: string;
      pgcr: DestinyPostGameCarnageReportData | null;
    }> => {
      try {
        checkCancelled();
        const pgcr = await this.getPostGameCarnageReport({
          accessToken: params.accessToken,
          activityId,
        });
        return { activityId, pgcr };
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
          return { activityId, pgcr: null };
        }
      }
    };

    let allEnqueued = false;
    const requestTrackers = new Map<
      string,
      Promise<{
        activityId: string;
        pgcr: DestinyPostGameCarnageReportData | null;
      }>
    >();
    const enqueueRequests = async () => {
      // Enqueue requests, keeping no more than MAX_CONCURRENT_REQUESTS in flight
      for (const activityId of params.activityIds.values()) {
        if (!activityId) break;

        while (requestTrackers.size >= MAX_CONCURRENT_REQUESTS) {
          await new Promise((resolve) => setTimeout(resolve, 15));
        }

        requestTrackers.set(
          activityId,
          processRequest(activityId).catch((error) => {
            // Individual request failures are already handled in processRequest
            console.error(`Unexpected error processing ${activityId}:`, error);
            return { activityId, pgcr: null };
          })
        );
      }

      allEnqueued = true;
    };

    void enqueueRequests();

    const getActivePromises = () => Array.from(requestTrackers.values());

    while (true) {
      try {
        checkCancelled();
      } catch {
        break;
      }

      // If no active requests, wait for enqueueing to catch up
      const activePromises = getActivePromises();
      if (activePromises.length === 0) {
        if (!allEnqueued) {
          // Wait a bit for enqueueRequests to add more requests
          await new Promise((resolve) => setTimeout(resolve, 5));
          continue;
        } else {
          // All enqueued and no active requests means we're done
          break;
        }
      }
      // Wait for any request to complete
      const completed = await Promise.race(activePromises);

      // Remove the completed promise
      requestTrackers.delete(completed.activityId);

      // Update progress
      completedCount++;
      const progress = (completedCount / total) * 100;

      // Yield individual PGCR if successful
      if (completed.pgcr) {
        yield {
          activityId: completed.activityId,
          pgcr: completed.pgcr,
          progress,
          completed: completedCount,
          total,
        };
      }
    }
  }

  async getPostGameCarnageReports(params: {
    accessToken: string;
    activityIds: Set<string>;
    signal?: AbortSignal;
  }): Promise<Map<string, DestinyPostGameCarnageReportData>> {
    // Stream individual requests and accumulate results
    const results = new Map<string, DestinyPostGameCarnageReportData>();

    try {
      for await (const {
        activityId,
        pgcr,
      } of this.getPostGameCarnageReportsStream({
        accessToken: params.accessToken,
        activityIds: params.activityIds,
        signal: params.signal,
      })) {
        results.set(activityId, pgcr);
      }
    } catch (error) {
      // Re-throw cancellation errors
      if (error instanceof Error && error.message === "Download cancelled") {
        throw error;
      }
      // For other errors, return what we have so far
      console.error("Error during PGCR download:", error);
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
