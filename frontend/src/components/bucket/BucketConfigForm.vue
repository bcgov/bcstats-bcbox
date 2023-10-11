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
  accessKeyId?: string;
  bucket?: string;
  bucketName?: string;
  endpoint?: string;
  key?: string;
  secretAccessKey?: string;
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
  accessKeyId: props.bucket?.accessKeyId,
  bucket: props.bucket?.bucket,
  bucketName: props.bucket?.bucketName,
  endpoint: props.bucket?.endpoint,
  key: props.bucket?.key,
  secretAccessKey: props.bucket?.secretAccessKey,
  adminPass: props.bucket?.adminPass
};

// Form validation schema
const schema = object({
  accessKeyId: string().max(255).label('Access Key ID'),
  bucket: string().max(255).label('Bucket'),
  bucketName: string().max(255).required().label('Bucket name'),
  endpoint: string().max(255).required().label('Endpoint'),
  key: string().matches(/^[^\\]+$/, 'Sub-path must not contain backslashes').required().max(255).label('Key'),
  secretAccessKey: string().max(255).required().label('Secret Access Key'),
  adminPass: string().max(255).required().label('Admin Password')
});

// Actions
const toast = useToast();

const onSubmit = async (values: any) => {
  try {
    const formBucket = {
      accessKeyId: values.accessKeyId,
      bucket: values.bucket,
      bucketName: values.bucketName,
      endpoint: values.endpoint,
      secretAccessKey: values.secretAccessKey,
      adminPass: values.adminPass,
    } as Bucket;

    // Only add key for new configurations
    if( !props.bucket && values.key && joinPath(values.key)) {
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
        label="Administrator Password *"
        placeholder="password"
        help-text="Administrator password used to create/update the bucket."
      />
      <TextInput
        name="key"
        label="Bucket sub-path *"
        placeholder="/"
        help-text="Sets the bucket to mount at a specific subdirectory.
          This value cannot be changed after the bucket is configured."
        :disabled="!!props.bucket"
      />
      <Button
        class="p-button mt-2 mr-1"
        label="Apply"
        type="submit"
        icon="pi pi-check"
      />
      <Button
        class="p-button-outlined mt-2"
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
