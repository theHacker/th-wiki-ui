<template>
    <li>
        <a class="dropdown-item" :class="{ disabled }" href="#" @click="$emit('click')">
            <span class="icon-link">
                <i v-if="icon" :class="iconClass" />
                <span v-if="title">{{ title }}</span>
            </span>
        </a>
    </li>
</template>

<script setup>
import {computed} from "vue";

const props = defineProps({
    icon: {
        type: String,
        required: false
    },
    iconColor: {
        type: String,
        required: false
    },
    title: {
        type: String,
        required: true
    },
    fixedWidth: {
        type: Boolean,
        default: false
    },
    disabled: {
        type: Boolean,
        default: false
    }
});

defineEmits(['click']);

const iconClass = computed(() => {
    const classes = {};

    classes['fas'] = true;
    classes[`fa-${props.icon}`] = true;

    if (props.fixedWidth) {
        classes['fa-fw'] = true;
    }
    if (props.iconColor && !props.iconColor.match(/#[0-9a-fA-F]{1,8}/)) {
        // TODO When statuses can be configured, iconColor could later be a string "#rrggbb",
        //      then we must inject it into style="color: #rrggbb".
        classes['text-' + props.iconColor] = true;
    }

    return classes;
});
</script>
