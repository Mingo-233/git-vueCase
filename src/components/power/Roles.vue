<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>角色管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片 -->
        <el-card >
            <el-button type="primary" @click="addDialogVisible = true"> 添加角色 </el-button>
            <el-table :data="rolesList" border stripe>
                <!-- 展开列 -->
                <el-table-column type="expand" >
                    <template slot-scope="scope">
                        <el-row class="bdbottom bdtopone vcenter"
                            v-for="(item1) in scope.row.children" :key="item1.id" >
                            <!-- 渲染一级权限 -->
                            <el-col :span="5">
                                <el-tag>{{item1.authName }}<i class="el-icon-caret-right"></i></el-tag>
                                </el-col>
                                <!-- 渲染二级三级权限 -->
                            <el-col :span="19">
                                <!-- 通过for循环渲染二三级 -->
                                <el-row :class="[i2 == 0 ? '' :'bttop','vcenter']"
                                    v-for="(item2,i2) in item1.children" :key="item2.id">  
                                    <el-col :span="6">
                                        <el-tag type="success">{{item2.authName }}<i class="el-icon-caret-right"></i></el-tag>  
                                        </el-col>
                                        <el-col :span="18">
                                        <el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id" 
                                        closable @close="removeRightById(scope.row,item3.id)">
                                            {{item3.authName }}</el-tag>
                                    </el-col>
                                </el-row>  
                            </el-col>
                        </el-row>  
                        <!-- <pre>{{scope.row}}</pre> -->
                    </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index" label="#" ></el-table-column>
                <el-table-column prop="roleName" label="角色名称" ></el-table-column>
                <el-table-column prop="roleDesc" label="角色描述" ></el-table-column>
                <el-table-column  label="操作" >
                    <template slot-scope="scope">
                        <el-row>
                         <el-col :span="8">
                             <el-button type="primary" icon="el-icon-edit" size="small" 
                             @click="showEditRole(scope.row.id)" >编辑</el-button></el-col>
                         <el-col :span="8">
                             <el-button type="warning" icon="el-icon-delete" size="small" 
                             @click="removeRole(scope.row.id)">删除</el-button></el-col>
                         <el-col :span="8">
                             <!-- enterable控制鼠标能否进入悬停的小标签中 false为不能-->
                             <el-tooltip  effect="dark" content="分配权限" placement="top-start" :enterable="false">
                            <el-button type="danger" icon="el-icon-setting" size="small"
                             @click="showRightsDialog(scope.row)" >分配</el-button>
                            </el-tooltip>
                        </el-col>
                    </el-row>
                    </template>
                </el-table-column>
            </el-table>

        </el-card>

        <!-- 添加角色对话框 -->
        <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" >
                <!-- 主体区域 -->
            <el-form :model="addRolesList" :rules="FormRules" ref="FormRef" label-width="100px" >
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="addRolesList.roleName"></el-input></el-form-item>
                <el-form-item label="角色描述"  >
                    <el-input v-model="addRolesList.roleDesc" ></el-input></el-form-item>
            </el-form>
                <!-- 底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible =false">取 消</el-button>
                <el-button type="primary" @click="addRoles">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 更改角色对话框 -->
        <el-dialog title="更改角色" :visible.sync="editDialogVisible" width="50%" >
                <!-- 主体区域 -->
            <el-form :model="editRolesList" :rules="FormRules" ref="FormRef" label-width="100px" >
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="editRolesList.roleName"></el-input></el-form-item>
                <el-form-item label="角色描述"  >
                    <el-input v-model="editRolesList.roleDesc" ></el-input></el-form-item>
            </el-form>
                <!-- 底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible =false">取 消</el-button>
                <el-button type="primary" @click="editRoles">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 树形控件对话框 -->
        <el-dialog title="分配权限" :visible.sync="rightsDialogVisible" width="50%" 
        @close="rightDialogClear">
            <!-- 树每个选项的id是data数据rightsList里面获取到的 -->
            <el-tree :data="rightsList" :props="rightProps" node-key='id' 
            default-expand-all show-checkbox :default-checked-keys='defkey' ref="treeRef"></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="rightsDialogVisible =false">取 消</el-button>
                <el-button type="primary" @click="addRight">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
        data:function(){
        return{
            //角色列表数据
            rolesList:[],
            //添加角色的表格数据
            addRolesList:{
                roleName:'',
                roleDesc:''
            },
            //更改角色的表格数据
            editRolesList:{
            },
            //控制增加角色弹出
            addDialogVisible:false,
            //控制更改角色弹出
            editDialogVisible:false,
            //控制权限框弹出
            rightsDialogVisible:false,
            //添加角色信息表单验证规则
            FormRules:{
                roleName:[
                    { required: true, message: '请输入角色名称', trigger: 'blur' }, 
                ]
            },
            //所有权限数据
            rightsList:[],
            //树形控件属性绑定
            rightProps:{
                children:'children',
                label:'authName'
            },
            //树形控件中选中的节点
            defkey:[],
            //当前角色的id
            roleID:''
        }
    },
    created:function(){
        this.getRolesList()
    },
    methods:{
        //获取角色列表
        getRolesList:async function(){
            const {data:res} =await this.$axios.get('roles');
            if(res.meta.status != 200) return this.$message.error('获取角色失败')
            this.rolesList = res.data;
            
        },
        // 添加角色
        addRoles:function(){
            this.$refs.FormRef.validate(async valid=>{
                if(!valid) return 
                const {data:res} = await this.$axios.post('roles',this.addRolesList);
                if(res.meta.status != 201) return this.$message.error('添加角色失败')
                this.addDialogVisible = false;
                //重新加载角色列表
                this.getRolesList();
            }) 
        },
        //编辑角色弹出
        showEditRole:async function(id){
            //查询数据
            const {data:res} = await this.$axios.get('roles/'+id);
            if(res.meta.status != 200) return this.$message.error('查询角色失败')
            //将查询到的所有数据都存了进去,包括roleId
            this.editRolesList = res.data;
            //打开弹窗
            this.editDialogVisible = true;
        },
        //编辑角色提交
        editRoles:function(){
            this.$refs.FormRef.validate(async valid=>{
                if(!valid) return 
                //这里的roleId是之前查询时，存到editRolesList数据中的
                const {data:res} = await this.$axios.put('roles/'+this.editRolesList.roleId,{
                    roleName:this.editRolesList.roleName,
                    roleDesc:this.editRolesList.roleDesc
                });
                if(res.meta.status != 200) return this.$message.error('更改角色信息失败')
                this.editDialogVisible = false;
                this.$message.success('更改成功')
                //重新加载角色列表
                this.getRolesList();
            }) 
        },
        //删除角色
        removeRole:async function(id){
            const {data:res} = await this.$axios.delete('roles/'+id);
            if(res.meta.status != 200) return this.$message.error('删除角色失败')
            this.$message.success('删除角色成功')
            //重新加载角色列表
            this.getRolesList();
        },
        //删除权限
        removeRightById:async function(role,rightId){
            const confirmResult = await this.$confirm('此操作将删除该权限, 是否继续?', '提示', {
                confirmButtonText: '确定',cancelButtonText: '取消',type: 'warning'})
                .catch(() => {
                //点取消按钮必须捕获异常
                this.$message({
                type: 'info',
                message: '已取消删除'
                });          
            });
            if(confirmResult == 'confirm'){
                const{data:res} = await this.$axios.delete(`roles/${role.id}/rights/${rightId}`);
                
                 if (res.meta.status !== 200) {
                    return this.$message.error('删除权限失败！')
                }
                
                //这里的role是函数的参数scope.row，将他里面的children直接更新掉，因为数据是绑定的页面就实时刷新了，
                //不需要调用getRolesList重新获取角色列表
                //scope.row中的数据 是从getRolesList填充到表格中，在从表格row行中获取的
                role.children = res.data;
                
               
            }
        },
        //显示分配权限页面
        showRightsDialog:async function(role){
            const{data:res} = await this.$axios.get('rights/tree');
            if (res.meta.status !== 200) {
                    return this.$message.error('获取权限失败！')
            }
            this.rightsList = res.data
            //获取全部三级权限节点，role是最大的父节点，defkey是记录节点id的数组
            this.getleafKey(role,this.defkey)
            //获取当前角色的id
            
            this.roleID = role.id
            
            this.rightsDialogVisible = true;
        },
        //使用递归获取全部的三级权限节点
        //node 表示节点，arr是数组
        getleafKey:function(node,arr){
            //如果没有该节点没有children，那就是第三极权限
            if(!node.children){
                return arr.push(node.id)
            }
            //递归，返回的值是记录的节点id的数组，直到取出最大的父节点下所有的三级权限
            //当节点没有children时就不会遍历了。
            node.children.forEach(item=>{
                this.getleafKey(item,arr)
            })
        },
        //退出权限框时清空保存的节点id
        rightDialogClear:function(){
            this.defkey = [];
        },
        //为角色分配权限
        addRight:async function(){
            //扩展运算符，可以将数组或者对象转化为逗号分隔的参数序列 例如1,2,3
            const Key = [...this.$refs.treeRef.getCheckedKeys(),
            ...this.$refs.treeRef.getHalfCheckedKeys()];
            console.log(Key);
            //idStr 为以，为分隔的字符串 例如'1,2,3'
            const idStr = Key.join(',')
            const {data:res} = await this.$axios.post(`roles/${this.roleID}/rights`,{rids:idStr})
            console.log(res);
            if (res.meta.status !== 200) {
                    return this.$message.error('分配权限失败！')
            }
            this.$message.success('分配权限成功！')
            this.rightsDialogVisible = false;
            this.getRolesList();
            
        }

    }
}
</script>

<style lang="less" scoped>
.el-tag{
    margin: 7px;
}
.bdbottom{
    border-bottom: 1px solid #eee;
}
.bdtopone:nth-child(1){
    border-top: 1px solid #eee;
}
.bttop{
    border-top: 1px solid #eee;
}
.vcenter{
    display: flex;
    align-items: center;
}
</style>