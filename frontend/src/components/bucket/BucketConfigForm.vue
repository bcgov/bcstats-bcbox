<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Form } from 'vee-validate';
import { object, string } from 'yup';

import Password from '@/components/form/Password.vue';
import TextInput from '@/components/form/TextInput.vue';
import { Button, useToast } from '@/lib/primevue';
import { useAuthStore, useBucketStore } from '@/store';
import { differential, joinPath } from '@/utils/utils';

import type { Bucket } from '@/types';

export type BucketForm = {
  bucketName?: string;
  key?: string;
  adminPass?: string;
};

// Props
type Props = {
  bucket?: Bucket;
};

const props = withDefaults(defineProps<Props>(), {
  bucket: undefined
});

// Emits
const emit = defineEmits(['cancel-bucket-config', 'submit-bucket-config']);

// Store
const bucketStore = useBucketStore();
const { getUserId } = storeToRefs(useAuthStore());

// Default form values
const initialValues: BucketForm = {
  bucketName: props.bucket?.bucketName,
  key: props.bucket?.key,
  adminPass: props.bucket?.adminPass
};

// Form validation schema
const schema = object({
  bucketName: string().max(255).required().label('Bucket name'),
  key: string().max(255).label('Key'),
  adminPass: string().max(255).required().label('Admin Password')
});

// Actions
const toast = useToast();

const onSubmit = async (values: any) => {
  try {
    const formBucket = {
      bucketName: values.bucketName,
      key: values.key,
      adminPass: values.adminPass,
    } as Bucket;

    // Only add key for new configurations
    if( !props.bucket && values.key ) {
      formBucket.key = joinPath(values.key);
    }

    props.bucket ?
      await bucketStore.updateBucket(props.bucket?.bucketId, differential(formBucket, initialValues)) :
      await bucketStore.createBucket(formBucket);

    await bucketStore.fetchBuckets({ userId: getUserId.value, objectPerms: true });
    emit('submit-bucket-config');

    toast.success('Configuring bucket', 'Bucket configuration successful');
  } catch (error: any) {
    toast.error('Configuring bucket', error);
  }
};

const onCancel = () => {
  emit('cancel-bucket-config');
};
</script>

<template>
  <div>
    <Form
      :initial-values="initialValues"
      :validation-schema="schema"
      @submit="onSubmit"
    >
      <TextInput
        name="bucketName"
        label="Bucket name *"
        placeholder="My Documents"
        help-text="The display name for the bucket - any name as you would like to see it listed in BC Stats LockBox."
        autofocus
      />
      <Password
        name="adminPass"
        label="Admin Password *"
        placeholder="password"
        help-text="Admin password to create a bucket"
      />
      <TextInput
        name="key"
        label="Key/Folder"
        placeholder="directory"
        help-text="A folder prefix within a bucket. The folder will be created if it doesn't already exist.
          Will default to '/' if not provided. This value cannot be changed after the bucket is configured."
        :disabled="!!props.bucket"
      />
      <Button
        class="mt-2"
        label="Apply"
        type="submit"
        icon="pi pi-check"
      />
      <Button
        class="p-button-text mt-2"
        label="Cancel"
        icon="pi pi-times"
        @click="onCancel"
      />
    </Form>
  </div>
</template>

<style lang="scss" scoped>

:deep(.p-inputtext) {
  width: 100% !important;
}

:deep(.pi-eye) {
  right: auto !important;
  margin-left: 10px;
}

:deep(.pi-eye-slash) {
  right: auto !important;
  margin-left: 10px;
}
</style>
