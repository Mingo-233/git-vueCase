<template>
    <div>
       <el-button type="info" @click="quit">退出</el-button> 
    </div>


</template>

<script>
export default {
    methods:{
        quit:function(){
            window.sessionStorage.clear();
            //编程式导航
            this.$router.push('/login');
        }
    }
}
</script>

<style lang="less" scoped>

</style>