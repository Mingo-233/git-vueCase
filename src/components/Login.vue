<template>
    <div class="login_container">
        <div class="login_box">
             <!-- 头像 -->
            <div class="avatar_box">
                <img src="../assets/logo.png" alt="">
            </div>
             <!-- 登录表单区域 -->
            <el-form class="login_form" ref="loginFormRef" :model="loginForm" :rules="rules">
                <!-- 用户名 -->
                <el-form-item prop="username">
                    <el-input v-model="loginForm.username" prefix-icon="el-icon-user-solid"></el-input>
                </el-form-item>
                <!-- 密码 -->
                <el-form-item prop="password">
                    <el-input v-model="loginForm.password" type="password" prefix-icon="el-icon-key"></el-input>
                </el-form-item>
                <!-- 按钮 -->
               <el-row class="btns"> 
                    <el-button type="primary" round @click="login">登录</el-button>
                    <el-button type="info" round @click="reset">重置</el-button>
                </el-row>
            </el-form> 
        </div>
       
    </div>
</template>

<script>
export default {
    data:function(){
        return {
            //登录表单的数据绑定对象
            loginForm:{
                username:'admin',
                password:'123456'
            },
            //表单验证规则
            rules:{
                username:[
                    {required:true,message:'请输入账号',trigger:'blur'},
                    {min:3,max:20,message:'请输入3-20个字符之内',trigger:'blur'}
                ],
                password:[
                    {required:true,message:'请输入密码',trigger:'blur'}
                ]
            }
        }
    },
    methods:{
        //重置按钮
        reset:function(){
            this.$refs.loginFormRef.resetFields();
        },
        //表单提交前的预验证
        login:function(){
            this.$refs.loginFormRef.validate(async valid=>{
                if(!valid) return 
                //login为请求路径，this.loginForm是表单数据,$axios是在入口文件中申明的变量
                //解构接收返回的数据里面的data属性里面的内容 :res 是将接收数据的data重命名res
                //请求失败，返回的是一个promise对象，所以用异步函数
                const {data:res} =await this.$axios.post('login',this.loginForm)
                console.log(res);
                if(res.meta.status !==200) return this.$message.error('登录失败')
                this.$message.success('登录成功')
                // 1登录成功后将token返回到客户单的sessionStronge中
                //   1.1项目中除了登录之外的api接口，都必须正在登录情况下访问
                //   1.2token只在当前网页打开的情况下生效，session的生命周期也只有浏览器打开的时候有效
                window.sessionStorage.setItem('token',res.data.token);
                //编程式导航
                this.$router.push('/home')
            })
        }
    }
}
</script>

<style lang="less" scoped>
.login_container{
    background-color: #2b4b6b;
    height: 100%;
}
.login_box{
    width: 500px;
    height: 350px;
    background: #ffffff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);

    .avatar_box{
        width: 130px;
        height: 130px;         
        border: 1px solid #eee;
        border-radius: 50%;
        padding: 10px;
        box-shadow: 0 0 10px #ddd;
        position: absolute;
        left: 50%;
        transform: translate(-50%,-50%);
        img{ 
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: #eee;
        }
        
    }

    .login_form{
        position: absolute;
        bottom: 20px;
        width: 100%;
        padding: 0 20px;
        box-sizing: border-box;
    }
    .btns{
        float: right;
    }
}
</style>