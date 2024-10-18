<template>
    <n-space vertical :size="12">
        <n-alert class="alert" :title="user ? `${user.emoji} ${user.name}` : 'Error'" :show-icon="false"
            :type="alertType">
            <div v-if="user && alertType == 'success'" class="alert-content">joined the room </div>
            <div v-if="user && alertType == 'error'" class="alert-content">left the room </div>
            <div v-if="alertType == 'error'" class="alert-content">{{ message }}</div>
        </n-alert>
    </n-space>
</template>

<script>
//import { IosAirplane } from "@vicons/ionicons4";

export default {
    props: {
        user: {
            type: {},
            default: null
        },
        alertType: {
            type: String,
            default: '',
            validator(value) {
                // The value must be 'success' or 'error'
                return ['success', 'error'].includes(value);
            }
        },
        message: {
            type: String,
            default: ''
        }
    }
};
</script>

<style lang="scss">
.n-alert .n-alert-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: rgb(44, 62, 80);

    .n-alert-body__title {
        font-weight: bold;
        color: rgb(44, 62, 80);

    }


    .n-alert-body__content div {
        font-weight: bold;
        color: rgb(44, 62, 80);
    }

}
</style>