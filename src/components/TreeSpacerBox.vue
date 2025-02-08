<!--suppress JSSuspiciousNameCombination -->
<template>
    <div>
        <span :class="{ 'border-end': top }" />
        <span :class="{ 'border-bottom': right }" />
        <span :class="{ 'border-end': bottom }" />
        <i
            v-if="button !== ''"
            class="fas fa-2xs"
            :class="{
                'fa-square-plus': button === '+',
                'fa-square-minus': button === '-',
                'cursor-pointer': hasButton
            }"
            @click="hasButton && $emit('click')"
        />
    </div>
</template>

<script setup>
import {computed} from "vue";

const props = defineProps({
    top: {
        type: Boolean,
        default: false
    },
    right: {
        type: Boolean,
        default: false
    },
    bottom: {
        type: Boolean,
        default: false
    },
    button: {
        type: String,
        default: '',
        validator(value, _props) {
            return ['', '-', '+'].includes(value);
        }
    }
});

defineEmits(['click']);

const hasButton = computed(() => {
    return props.button === '+' || props.button === '-';
})
</script>

<style lang="scss" scoped>
div {
    $size: 24px;

    display: grid;
    grid-template-rows: repeat(2, calc($size / 2));
    grid-template-columns: repeat(2, calc($size / 2));

    width: $size;
    height: $size;

    span {
        --bs-border-style: dotted;
    }

    i {
        position: relative;

        // centers the button on the line's intersection
        left: -40%;
        top: -10%;
    }
}
</style>
