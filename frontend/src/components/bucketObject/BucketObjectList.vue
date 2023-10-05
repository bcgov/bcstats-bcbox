<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref, onMounted } from 'vue';

import { BucketObjectTable } from '@/components/bucketObject';
import { Button, Dialog, Message } from '@/lib/primevue';
import { useAuthStore, useBucketObjectStore, usePermissionStore } from '@/store';

import type { Ref } from 'vue';
import type { Bucket } from '@/types';

// Store
const bucketObjectStore = useBucketObjectStore();
const { getUserId } = storeToRefs(useAuthStore());

// State

// Actions
onMounted(async () => {
  await bucketObjectStore.fetchBucketObjects({ userId: getUserId.value, objectPerms: true });
});
</script>

<template>
  <div>
    <div class="flex">
      <div class="flex-grow-1">
        <BucketObjectTable
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
h1 {
  font-weight: bold;
}

button {
  text-indent: 10px;
}
</style>
