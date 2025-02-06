<template>
    <n-space vertical :size="12">
        <n-alert :show-icon="false" type="success">
            <template #icon>

            </template>
            {{ userInfo.emoji }} {{ userInfo.name }} has joined the room
        </n-alert>
    </n-space>
</template>

<script>
import { IosAirplane } from "@vicons/ionicons4";

export default {
    components: {
        // eslint-disable-next-line vue/no-unused-components
        IosAirplane
    },
    props: {
        userInfo: {
            type: {},
            default: null
        },
        message: {
            type: String,
            default: ''
        }
    }
};
</script>