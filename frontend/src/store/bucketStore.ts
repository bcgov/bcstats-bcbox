import { defineStore, storeToRefs } from 'pinia';
import { computed, ref } from 'vue';

import { useToast } from '@/lib/primevue';
import { bucketService } from '@/services';
import { useAppStore, useAuthStore, usePermissionStore, useUserStore } from '@/store';
import { partition } from '@/utils/utils';

import type { Ref } from 'vue';
import type { Bucket, BucketSearchPermissionsOptions } from '@/types';

export type BucketStoreState = {
  buckets: Ref<Array<Bucket>>
}

export const useBucketStore = defineStore('bucket', () => {
  const toast = useToast();

  // Store
  const appStore = useAppStore();
  const permissionStore = usePermissionStore();
  const { getUserId } = storeToRefs(useAuthStore());

  // State
  const state: BucketStoreState = {
    buckets: ref([])
  };

  // Getters
  const getters = {
    getBuckets: computed(() => state.buckets.value)
  };

  // Actions
  async function createBucket(bucket: Bucket) {
    try {
      appStore.beginIndeterminateLoading();

      return (await bucketService.createBucket(bucket)).data;
    }
    finally {
      appStore.endIndeterminateLoading();
    }
  }

  async function fetchBuckets(params?: BucketSearchPermissionsOptions) {
    try {
      appStore.beginIndeterminateLoading();

      // Get a unique list of bucket IDs the user has access to
      const permResponse = await permissionStore.fetchBucketPermissions(params);
      if (permResponse) {
        const uniqueIds: string[] = [...new Set<string>(permResponse.map((x: { bucketId: string }) => x.bucketId))];

        let response = Array<Bucket>();
        if (uniqueIds.length) {
          response = (await bucketService.searchBuckets({ bucketId: uniqueIds })).data;

          // Remove old values matching search parameters
          const matches = (x: Bucket) => (
            (!params?.bucketId || x.bucketId === params.bucketId)
          );

          const [match, difference] = partition(state.buckets.value, matches);

          // Merge and assign
          state.buckets.value = difference.concat(response);
        }
        else {
          state.buckets.value = response;
        }
      }
    }
    catch (error) {
      toast.add({ severity: 'error', summary: 'Error fetching buckets', detail: error, life: 3000 });
    }
    finally {
      appStore.endIndeterminateLoading();
    }
  }

  function getBucketById(bucketId: string) {
    return state.buckets.value.find((x) => x.bucketId === bucketId);
  }

  async function updateBucket(bucketId: string, bucket: Bucket) {
    try {
      appStore.beginIndeterminateLoading();

      return (await bucketService.updateBucket(bucketId, bucket)).data;
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
    createBucket,
    fetchBuckets,
    getBucketById,
    updateBucket
  };
}, { persist: true });

export default useBucketStore;
