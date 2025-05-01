<template>
    <div :class="`alert alert-${color} hstack gap-2`">
        <i v-if="icon" :class="`fas fa-${icon}`" />
        <div><slot /></div>
    </div>
</template>

<script setup>
defineProps({
    color: {
        validator(value, _props) {
            // see https://getbootstrap.com/docs/5.3/components/buttons/#variants
            return [
                'primary', 'secondary',
                'success', 'danger', 'warning', 'info',
                'light', 'dark', 'link'
            ].includes(value);
        },
        required: true
    },
    icon: {
        type: String,
        required: false
    }
});
</script>
