<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onBeforeMount, ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  DestroyObjectButton,
  DownloadObjectButton,
  ObjectSidebar,
  ObjectTable,
  ObjectUpload
} from '@/components/object';
import { Button, useToast } from '@/lib/primevue';
import {
  useAuthStore,
  useBucketStore,
  useObjectStore,
  usePermissionStore
} from '@/store';
import { Permissions, RouteNames } from '@/utils/constants';
import { ButtonMode } from '@/utils/enums';

import type { Ref } from 'vue';
import type { Bucket, BucketPermission } from '@/types';

// Props
type Props = {
  bucketId?: string
};

const props = withDefaults(defineProps<Props>(), {
  bucketId: undefined
});

// Store
const bucketStore = useBucketStore();
//const navStore = useNavStore();
const objectStore = useObjectStore();
const permissionStore = usePermissionStore();

const { getSelectedObjects } = storeToRefs(objectStore);
const { getUserId } = storeToRefs(useAuthStore());

// State
const displayUpload = ref(false);
const objectInfoId: Ref<string | undefined> = ref(undefined);
const bucket: Ref<Bucket | undefined> = ref(undefined);

const selectedObjectIds = computed(() => {
  return getSelectedObjects.value.map((o) => o.id);
});

// Actions
const router = useRouter();
const toast = useToast();

const showObjectInfo = async (objectId: string | undefined) => {
  objectInfoId.value = objectId;
};

const closeObjectInfo = () => {
  objectInfoId.value = undefined;
};

const showUpload = () => {
  displayUpload.value = true;
};

const closeUpload = () => {
  displayUpload.value = false;
};

// const updateBreadcrumb = async () => {
//   try {
//     const bucket = await bucketStore.getBucketInfo(props.bucketId as string);
//     navStore.replace('__listObjectsDynamic', bucket?.bucketName ?? 'Unknown bucket');
//   } catch (error: any) {
//     toast.add({ severity: 'error', summary: 'Unable to load bucket information.', detail: error, life: 5000 });
//   }
// };

function onDeletedSuccess() {
  toast.success('File deleted');
}

onBeforeMount( async () =>{
  if(props.bucketId){
    const permResponse = await permissionStore.fetchBucketPermissions({userId: getUserId.value, objectPerms: true});
    if( !permResponse.some( (x: BucketPermission) => x.bucketId === props.bucketId ) ) {
      router.replace({ name: RouteNames.FORBIDDEN });
    }
    else {
      await bucketStore.fetchBuckets({userId: getUserId.value, objectPerms: true});
      bucket.value = bucketStore.findBucketById(props.bucketId);

      if (!bucket.value || 
          !permissionStore.isBucketActionAllowed(bucket.value.bucketId, getUserId.value, Permissions.READ)){
        router.replace({name: RouteNames.FORBIDDEN});
      }

      await objectStore.fetchObjects({ bucketId: props.bucketId, userId: getUserId.value, bucketPerms: true});
    }
  }
});

/*onMounted(async () => {
  // Removed for now
  // updateBreadcrumb();

  await bucketStore.fetchBuckets({ userId: getUserId.value, objectPerms: true });
  // TODO: userId+bucketPerms bringing back deleted files??
  await objectStore.fetchObjects({ bucketId: props.bucketId, userId: getUserId.value, bucketPerms: true });
});*/

</script>

<template>
  <div>
    <div
      v-if="displayUpload"
      class="mb-4"
    >
      <ObjectUpload
        :bucket-id="props.bucketId"
        :close-callback="closeUpload"
      />
    </div>
    <div>
      <Button
        v-if="permissionStore.isBucketActionAllowed(props.bucketId as string, getUserId, Permissions.CREATE)"
        class="mr-2"
        :disabled="displayUpload"
        @click="showUpload"
      >
        <font-awesome-icon
          icon="fa-solid fa-upload"
          class="mr-1"
        /> Upload
      </Button>
      <DownloadObjectButton
        :disabled="displayUpload"
        :ids="selectedObjectIds"
        :mode="ButtonMode.BUTTON"
      />
      <DestroyObjectButton
        :disabled="displayUpload"
        :ids="selectedObjectIds"
        :mode="ButtonMode.BUTTON"
        @on-deleted-success="onDeletedSuccess"
      />
    </div>

    <div
      class="flex mt-4"
      :class="{ 'disable-overlay': displayUpload }"
    >
      <div class="flex-grow-1">
        <ObjectTable
          :bucket-id="props.bucketId"
          :object-info-id="objectInfoId"
          @show-object-info="showObjectInfo"
        />
      </div>
      <div
        v-if="objectInfoId"
        class="flex-shrink-0 ml-3"
        style="max-width: 33%; min-width: 33%"
      >
        <ObjectSidebar
          :object-id="objectInfoId"
          @close-object-info="closeObjectInfo"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.disable-overlay {
  pointer-events: none;
  opacity: 0.4;
}
</style>
