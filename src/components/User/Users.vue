<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片 -->
        <el-card class="">
            <!-- 搜索框 -->
            <el-row :gutter="30" >
                <el-col :span="12">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
                    <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button> 
                    </el-input>
                </el-col>
                <el-col :span="8">
                    <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
                </el-col>
            </el-row>
            <!-- 表格     带边框和斑纹纹-->  
             <el-table :data="userList"  :border="true" :stripe="true">
                 <el-table-column type="index" label="#"></el-table-column>
                 <el-table-column prop="username" label="姓名" ></el-table-column>
                 <el-table-column prop="email" label="邮箱" ></el-table-column>
                 <el-table-column prop="mobile" label="电话" ></el-table-column>
                 <el-table-column prop="role_name" label="角色" ></el-table-column>
                 <el-table-column prop="mg_state" label="状态">
                     <!-- 作用域插槽，这里的row是elementUI里传过来的，所以这里插槽直接输出，没有定义 -->
                     <template slot-scope="soltProps">
                         <!-- {{soltProps.row}} -->
                         <el-switch v-model="soltProps.row.mg_state"  @change="statusChange(soltProps.row)"></el-switch>
                     </template>
                 </el-table-column>
                 <el-table-column  label="操作" >
                     <template slot-scope="soltProps">
                     <el-row>
                         <el-col :span="8">
                             <el-button type="primary" icon="el-icon-edit" size="mini" 
                             @click="showEditDialog(soltProps.row.id)"></el-button></el-col>
                         <el-col :span="8">
                             <el-button type="warning" icon="el-icon-delete" size="mini"
                             @click="removeUserByid(soltProps.row.id)"></el-button></el-col>
                         <el-col :span="8">
                             <!-- enterable控制鼠标能否进入悬停的小标签中 false为不能-->
                             <el-tooltip  effect="dark" content="分配角色" placement="top-start" :enterable="false">
                            <el-button type="danger" icon="el-icon-setting" size="mini"></el-button>
                            </el-tooltip></el-col>
                    </el-row></template>
                 </el-table-column>

            </el-table>
            <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>
        <!-- 添加用户对话框 -->
            <!-- 头部区域 -->
        <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClear">
                <!-- 主体区域 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" >
                <el-form-item label="账号" prop="username">
                    <el-input v-model="addForm.username"></el-input></el-form-item>
                <el-form-item label="密码" prop="password" >
                    <el-input v-model="addForm.password" type="password"></el-input></el-form-item>
                <el-form-item label="邮箱" prop="email"
                ><el-input v-model="addForm.email"></el-input></el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="addForm.mobile"></el-input></el-form-item>
            </el-form>
                <!-- 底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible =false">取 消</el-button>
                <el-button type="primary" @click="addUsers">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 更改用户信息对话框 -->
        <el-dialog title="更改信息" :visible.sync="editDialogVisible"
        width="50%">
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" 
            label-width="100px" @close="editFormClear">
                <el-form-item label="账号">
                    <el-input v-model="editForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input  v-model="editForm.email"></el-input>
                </el-form-item>
                <el-form-item label="电话" prop="mobile">
                    <el-input   v-model="editForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUsers">确 定</el-button>
            </span>
        </el-dialog>


    </div>
    
</template>

<script>
export default {
    data:function(){
        // 验证邮箱的规则
        var checkEmail = (rule,value,callback)=>{
            // 验证邮箱的正则表达式
            const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
            //value 是输入框输入的值
            if(regEmail.test(value)){
                //合法的值
                return callback()
            }
            callback(new Error('请输入合法的邮箱地址'))
        }
        // 验证手机号的规则
        var checkPhone = (rule,value,callback)=>{
            // 验证邮箱的正则表达式
            const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
            //value 是输入框输入的值
            if(regMobile.test(value)){
                //合法的值
                return callback()
            }
            callback(new Error('请输入合法的手机号'))
        }
        return{
            //获取用户列表对应参数
            queryInfo:{
                query:'',
                pagenum:1,
                pagesize:5
            },
            userList:[],
            total:0,
            //控制对话框显示与否
            addDialogVisible:false,
            editDialogVisible:false,
            //添加用户表单数据
            addForm:{
                username:'',
                password:'',
                email:'',
                mobile:''
            }, 
            //添加表单验证规则
            addFormRules:{
                username:[
                    { required: true, message: '请输入账号', trigger: 'blur' },
                    { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
                ],
                password:[
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                ],
                email:[
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { validator:checkEmail,trigger:'blur'}
                ],
                mobile:[
                    { required: true, message: '请输入手机号', trigger: 'blur' },
                    { validator:checkPhone,trigger:'blur'}
                ]
            },
            //更改用户信息表单数据
            editForm:{},
            //更改账号信息表单验证规则
            editFormRules:{
                email:[
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { validator:checkEmail,trigger:'blur'}
                ],
                mobile:[
                    { required: true, message: '请输入手机号', trigger: 'blur' },
                    { validator:checkPhone,trigger:'blur'}
                ]
            }
        }
    },
    created:function(){
        this.getUserList()
    },
    methods:{
        getUserList:async function(){
            const {data:res} = await this.$axios.get('users',{params:this.queryInfo})
            // console.log(res);
            if(res.meta.status != 200) return this.$message.error('获取用户列表失败');
            
            this.userList = res.data.users;
            this.total = res.data.total;
        },
        //监听每页显示数据条数改变
        handleSizeChange:function(newSize){
            // console.log(newSize);
            this.queryInfo.pagesize = newSize;
            this.getUserList()
        },
        // 监听页码值 改变事件
        handleCurrentChange:function(newpage){
            // console.log(newpage);
            this.queryInfo.pagenum = newpage
            this.getUserList()
        },
        //监听switc开关状态
        statusChange:async function(userinfo){
            
            const {data:res} = await this.$axios.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
            console.log(res);
            if(res.meta.status != 200){
                userinfo.mg_state = !userinfo.mg_state;
                return this.$message.error('更改状态失败');
            }
            this.$message.success('更改成功')
        },
        //重置添加用户表单
        addDialogClear:function(){
            this.$refs.addFormRef.resetFields();
        },
        //添加用户
        addUsers:function(){
            //回调函数返回一个布尔值
            this.$refs.addFormRef.validate(async cb =>{
                //不通过则停止向下执行
                if(!cb)  return
                //通过开始向服务器发送添加请求
                const {data:res} =await this.$axios.post('users',this.addForm);
                if(res.meta.status != 201){
                    this.$message.error('添加用户失败')
                }
                this.$message.success('添加用户成功');
                //关闭对话框
                this.addDialogVisible = false;
                //重新加载用户列表
                this.getUserList()
            })
        },
        //显示用户信息更改表单
        showEditDialog:async function(id){           
            const {data:res} = await this.$axios.get('users/'+id)
            console.log(res);
            if(res.meta.status !=200) {
                return this.$message.error('查询用户失败')
            }
            this.editForm = res.data;
            this.editDialogVisible = true;
        },
        //重置更改用户表单
        editFormClear:function(){
            this.$refs.editFormRef.resetFields();
        },
        //更改用户信息
        editUsers:function(){
            this.$refs.editFormRef.validate(async cb=>{
                if(!cb)  return
                //通过验证发送更改信息请求
                //id为必填参数，而email和mobile是选填，所以分开传输参数
                const {data:res} = await this.$axios.put('users/'+this.editForm.id,{
                    email:this.editForm.email,
                    mobile:this.editForm.mobile
                })
                if(res.meta.status !=200){
                    return this.$message.error('更新用户信息失败')
                }
                //关闭对话框
                this.editDialogVisible = false;
                //重新加载用户列表
                this.getUserList();
                this.$message.success('更新成功')
            })
        },
        //删除用户
        removeUserByid:async function(id){
            const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',cancelButtonText: '取消',type: 'warning'
        }).catch(() => {
            //点取消按钮必须捕获异常
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
            if(confirmResult == 'confirm'){
                const {data:res} = await this.$axios.delete('users/'+id);
                if(res.meta.status != 200){
                    return this.$message({type: 'danger', message: '删除失败!'});
                }
                this.$message({type: 'success', message: '删除成功!'});
                this.getUserList();
            }
        }
    }
}
</script>

<style lang="less" scoped>

</style>