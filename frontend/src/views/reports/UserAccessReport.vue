<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, onErrorCaptured, ref } from 'vue';
import { useRouter } from 'vue-router';

import { BucketObjectList } from '@/components/bucketObject';
import { useToast } from '@/lib/primevue';
import { useAuthStore, usePermissionStore } from '@/store';
import { RouteNames } from '@/utils/constants';

import type { Ref } from 'vue';
import type { BucketPermission, COMSObjectPermission } from '@/types';

// Props
type Props = {
  bucketId?: string,
  objectId?: string,
  userId?: string
};

const props = withDefaults(defineProps<Props>(), {
  bucketId: undefined,
  objectId: undefined,
  userId: undefined
});

// Store
const permissionStore = usePermissionStore();
const { getUserId } = storeToRefs(useAuthStore());

// State
const ready: Ref<boolean> = ref(false);

// Actions

onErrorCaptured((e: Error) => {
  const toast = useToast();
  toast.error('Loading', e.message);
});

onBeforeMount( async () => {
  const router = useRouter();

  if (!getUserId.value) await useAuthStore()._updateState();

  const permBucketResponse = await permissionStore.fetchBucketPermissions({ userId: getUserId.value
    , objectPerms: true });
  const permObjectResponse = await permissionStore.fetchObjectPermissions({ userId: getUserId.value });
  if( !permBucketResponse.some( (x: BucketPermission) => x.bucketId === props.bucketId ) && 
      !permObjectResponse.some( (x: COMSObjectPermission) => x.objectId == props.objectId )) {
    router.replace({ name: RouteNames.FORBIDDEN });
  }
  else {
    ready.value = true;
  }
});
</script>

<template>
  <div v-if="ready">
    <h1>
      User Access Report
    </h1>
    <BucketObjectList 
      :bucket-id="props.bucketId" 
      :object-id="props.objectId" 
      :user-id="props.userId" 
    />
  </div>
</template>

<style scoped lang="scss">
h2 svg{
  color: $bcbox-primary;
}
</style>
