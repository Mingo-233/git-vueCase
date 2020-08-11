<template>
    <el-container class="home-container">
        <!-- 头部 -->
        <el-header>
            <div>
                <img src="../assets/logo2.png" alt="">
                <span>后台管理系统</span>
            </div>
            <el-button type="info" @click="quit">退出</el-button>
            </el-header>
        
        <!-- 页面主体区域 -->
        <el-container>
            
            <!-- 左侧边栏 -->
            <el-aside :width="isCollapse ? '64px':'200px'">
            <div class="toggle-button" @click="toggleCollapse">|||</div>
                    <el-menu  background-color="#333744" text-color="#fff"
                    active-text-color="#409eff" :unique-opened="true" :collapse="isCollapse"
                    :collapse-transition="false" :router="true" :default-active="activePath">
                    <!-- 一级菜单 -->
                            <!-- v-for 里面index 是每项索引 -->
                    <el-submenu  :index="item.id+''" v-for='(item,index) in menuList' :key='item.id'>
                    <!-- 一级菜单模板区域 -->
                    <template slot="title">
                        <!-- 图标 -->
                        <i :class=icons[index]></i>
                        <!-- 文字 -->
                        <span>{{item.authName}}</span>
                    </template>
                    <!-- 二级菜单 -->
                    <el-menu-item-group>
                        <el-menu-item :index="'/'+subitem.path" v-for="subitem in item.children" :key="subitem.id"
                        @click="savePath('/'+subitem.path)">
                            <template slot="title">
                                <!-- 图标 -->
                                <i class="el-icon-menu"></i>
                                <!-- 文字 -->
                                <span>{{subitem.authName}}</span>
                            </template>
                        </el-menu-item>
                    </el-menu-item-group>
                    </el-submenu>
            
                </el-menu>

            </el-aside>
            <!-- 右侧主体 -->
            <el-main>
                <!-- 路由占位符 -->
    
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>


</template>

<script>
export default {
    data:function(){
        return {
            //左边菜单栏数据
            menuList:[],
            //用户 权限 商品 订单 数据
            icons:["el-icon-user-solid","el-icon-thumb","el-icon-s-goods","el-icon-truck","el-icon-news"],
            isCollapse:false,
            activePath:''
        }
    },
    created:function(){
        this.getMenuList(),
        //页面创建时，将浏览器存储的激活路径复制，让选择的侧边栏高亮
        this.activePath = window.sessionStorage.getItem('activePath')
    },
    methods:{
        quit:function(){
            window.sessionStorage.clear();
            //编程式导航
            this.$router.push('/login');
        },
        getMenuList:async function(){
            //返回的是promise对象，访问路由是menus
            const {data:res} = await this.$axios.get('menus')
            if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.menuList = res.data
        },
        //按钮，切换菜单折叠
        toggleCollapse:function(){
            this.isCollapse = !this.isCollapse
        },
        // 保存链接的激活状态
        savePath:function(path){
            window.sessionStorage.setItem('activePath',path)
            this.activePath = path
        }
    }
}
</script>

<style lang="less" scoped>
.home-container{
    height: 100%;
}
.el-header{
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    color: white;
    font-size: 20px;
    align-items: center;
    > div{
        display: flex;
        align-items: center;
        span {
            margin-left: 15px;
        }
    }
}
.el-aside{
    background-color: #333744;
    .el-menu{
        border-right: none;
    }
}
.el-main{
    background-color: #eaedf1;
}
.toggle-button{
    background-color: #4a5064;
    font-size: 10px;
    line-height: 24px;
    color: white;
    text-align: center;
    //字符间空隙，父元素字体的0.2倍
    letter-spacing: 0.2em;
    cursor: pointer;
}
</style>