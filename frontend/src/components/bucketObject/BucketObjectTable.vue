<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

import BucketPermission from '@/components/bucket/BucketPermission.vue';
import { Spinner } from '@/components/layout';
import { Button, Column, DataTable, Dialog, useConfirm } from '@/lib/primevue';
import { useAppStore, useAuthStore, useBucketObjectStore } from '@/store';
import { Permissions, RouteNames } from '@/utils/constants';

import type { Ref } from 'vue';
import type { Bucket } from '@/types';

// Store
const bucketObjectStore = useBucketObjectStore();
const { getIsLoading } = storeToRefs(useAppStore());
const { getUserId } = storeToRefs(useAuthStore());
const { getBucketObjects } = storeToRefs(bucketObjectStore);

// State

// Actions

</script>

<template>
  <div>
    <DataTable
      :loading="getIsLoading"
      :value="getBucketObjects"
      data-key="bucketId"
      class="p-datatable-sm"
      responsive-layout="scroll"
      :paginator="true"
      :rows="100"
      paginator-template="RowsPerPageDropdown CurrentPageReport FirstPageLink 
        PrevPageLink JumpToPageDropdown NextPageLink LastPageLink "
      current-page-report-template="{first}-{last} of {totalRecords}"
      :rows-per-page-options="[100, 500, 1000]"
      sort-field="bucketName"
      :sort-order="1"
    >
      <template #empty>
        <div
          v-if="!getIsLoading"
          class="flex justify-content-center"
        >
          <h3>There are no buckets associated with your account.</h3>
        </div>
      </template>
      <template #loading>
        <Spinner />
      </template>
      <Column header-style="width: 1%">
        <template #body>
          <span class="row-head">
            <font-awesome-icon icon="fa-solid fa-box-open" />
          </span>
        </template>
      </Column>
      <Column
        field="bucketName"
        header="Bucket Name"
        body-class="truncate"
      >
        <template #body="{ data }">
          <div
            v-if="data.bucketName.length > 150"
            v-tooltip.bottom="{ value: data.bucketName }"
          >
            <router-link :to="{ name: RouteNames.LIST_OBJECTS, query: { bucketId: data.bucketId } }">
              {{ data.bucketName }}
            </router-link>
          </div>
          <div v-else>
            <router-link :to="{ name: RouteNames.LIST_OBJECTS, query: { bucketId: data.bucketId } }">
              {{ data.bucketName }}
            </router-link>
          </div>
        </template>
      </Column>
      <Column
        field="objectName"
        header="File Name"
        body-class="truncate"
      >
        <template #body="{ data }">
          <div
            v-if="data.objectName.length > 150"
            v-tooltip.bottom="{ value: data.objectName }"
          >
            <router-link :to="{ name: RouteNames.DETAIL_OBJECTS, query: { objectId: data.objectId } }">
              {{ data.objectName }}
            </router-link>
          </div>
          <div v-else>
            <router-link :to="{ name: RouteNames.DETAIL_OBJECTS, query: { objectId: data.objectId } }">
              {{ data.objectName }}
            </router-link>
          </div>
        </template>
      </Column>
      <Column
        field="userName"
        header="User Name"
        body-class="truncate"
      >
        <template #body="{ data }">
          <div
            v-tooltip.bottom="{ value: data.userName }"
          >
            {{ data.userName }}
          </div>
        </template>
      </Column>
      <Column
        field="permissions"
        header="Permissions"
        body-class="truncate"
      >
        <template #body="{ data }">
          <div
            v-tooltip.bottom="{ value: data.permissions }"
          >
            {{ data.permissions }}
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped lang="scss">
.row-head {
  color: $bcbox-primary;
}
</style>
