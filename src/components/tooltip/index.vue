<template>
    <Transition name="show">
        <div v-if="show" class="wrapper">
            <div class="tip">
                <slot>Attention!</slot>
            </div>
            <div class="close" @click="onClose">close</div>
        </div>
    </Transition>
</template>
  
<script lang="ts">
export default {
    name: "Tooltip",
    props: {
        position: String,
    },
    data() {
        return {
            show: false,
        };
    },
    methods: {
        onClose() {
            this.show = false;
            this.$nextTick(() => {
                this.$emit("close");
            });
        },
    },
    mounted() {
        setTimeout(() => {
            this.show = true;
        }, 20);
        setTimeout(() => {
            this.show = false;
            this.onClose();
        }, 3020);
    },
};
</script>
  
<style scoped lang="less">
.show-enter-from {
    transform: translateX(30px);
    opacity: 0;
}

.show-leave-to {
    transform: translateY(-30px);
    opacity: 0;
}

.show-enter-active,
.show-leave-active {
    transition: all 0.4s linear;
}

.wrapper {
    position: absolute;
    right: 20px;
    top: 20px;
    // width: 50%;
    min-width: 300px;
    border: 1px solid #f7cb04;
    border-radius: 6px;
    padding: 6px 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(#000, 0.7);

    .close {
        margin-left: 36px;
        color: #f7cb04;
        font-size: 0.6em;
        cursor: pointer;
        font-weight: 500;
    }
}
</style>
  