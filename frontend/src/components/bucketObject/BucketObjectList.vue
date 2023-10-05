<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';

import { BucketObjectTable } from '@/components/bucketObject';
import { useAuthStore, useBucketObjectStore } from '@/store';

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
        <BucketObjectTable />
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
