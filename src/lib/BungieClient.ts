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
} from "bungie-net-core/endpoints/Destiny2";
import {
  BungieMembershipType,
  DestinyHistoricalStatsPeriodGroup,
  DestinyManifest,
} from "bungie-net-core/models";

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
                    (a) => new Date(a.period).getFullYear() === 2024
                  ) ?? [];
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
}

function* pageGenerator() {
  let page = 0;
  while (true) {
    yield page++;
  }
}
