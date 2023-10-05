import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { useToast } from '@/lib/primevue';
import { bucketService, objectService } from '@/services';
import { useAppStore, usePermissionStore } from '@/store';
import { partition } from '@/utils/utils';

import type { Ref } from 'vue';
import type { BucketObject, BucketSearchPermissionsOptions } from '@/types';

export type BucketObjectStoreState = {
  bucketObjects: Ref<Array<BucketObject>>
}

export const useBucketObjectStore = defineStore('bucketObject', () => {
  const toast = useToast();

  // Store
  const appStore = useAppStore();
  const permissionStore = usePermissionStore();

  // State
  const state: BucketObjectStoreState = {
    bucketObjects: ref([])
  };

  // Getters
  const getters = {
    getBucketObjects: computed(() => state.bucketObjects.value)
  };

  // Actions
  async function fetchBucketObjects(params?: BucketSearchPermissionsOptions) {
    try {
      appStore.beginIndeterminateLoading();

      // Get a unique list of bucket IDs the user has access to
      const permBucketResponse = await permissionStore.fetchBucketPermissions(params);
      const permObjectResponse = await permissionStore.fetchObjectPermissions(params);
      if (permBucketResponse || permObjectResponse) {
        const uniqueBucketIds: Array<string> = [
          ...new Set<string>(permBucketResponse.map((x: { bucketId: string }) => x.bucketId))
        ];
        const uniqueObjectIds: Array<string> = [
          ...new Set<string>(permObjectResponse.map((x: { objectId: string }) => x.objectId))
        ];

        let response = Array<BucketObject>();
        if (uniqueBucketIds.length) {
          let bucketResponse = (await bucketService.searchBuckets({ bucketId: uniqueBucketIds })).data;
          let objectResponse = (await objectService.searchObjects({ objectId: uniqueObjectIds })).data;

          // Remove old values matching search parameters
          const matches = (x: BucketObject) => (
            (!params?.bucketId || x.bucketId === params.bucketId)
          );

          const [, difference] = partition(state.bucketObjects.value, matches);

          // Merge and assign
          state.bucketObjects.value = difference.concat(response);
        }
        else {
          state.bucketObjects.value = response;
        }
      }
    }
    catch (error: any) {
      toast.error('Fetching bucket objects', error);
    }
    finally {
      appStore.endIndeterminateLoading();
    }
  }

  return {
    // State
    ...state,

    // Getters
    ...getters,

    // Actions
    fetchBucketObjects,
  };
});

export default useBucketObjectStore;
