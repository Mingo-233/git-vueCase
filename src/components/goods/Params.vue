<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <!-- 提示区 -->
            <el-alert title="只允许为第三极分类设置相关参数" type="warning" :losable='false' show-icon></el-alert>
            <!-- 选择级联框 -->
            <el-row class="params">
                <el-col>
                    <span>选择商品分类：</span>
                    <!-- 选择商品分类的选择级联框 -->
                    <el-cascader
                    v-model="cateSelectedKey"
                    :options="cateList"
                    :props="cateProps"
                    @change="cateChange"></el-cascader>
                </el-col>
            </el-row>

            <!-- 标签页 -->
            <el-tabs v-model="activeTabName" @tab-click="tabClick">
                <!-- 添加动态参数面板 -->
                <el-tab-pane label="动态参数" name="many">
                    <el-button type="primary" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加参数</el-button>
                    <!-- 动态参数表格 -->
                    <el-table :data="manyTabData" border >
                        <!-- 展开行 -->
                        <el-table-column type="expand" >
                            <template slot-scope="scope">
                                <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" closable @close='closeTag(index,scope.row)'>
                                    {{item}}
                                </el-tag>
                                <el-input class="input-new-tag" v-if="scope.row.tagInputVisible" v-model="scope.row.tagInputValue"
                                ref="saveTagInput" size="small" 
                                @keyup.enter.native="handleInputConfirm(scope.row)"
                                @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <!-- 索引行 -->
                        <el-table-column type="index" label="#" ></el-table-column>
                        <el-table-column prop="attr_name" label="属性名称" ></el-table-column>
                        <el-table-column  label="操作" >
                            <template slot-scope="scope">
                            <el-button size="mini" type="primary" icon="el-icon-edit" >编辑</el-button>
                            <el-button size="mini" type="danger" icon="el-icon-delete" 
                            @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                
                <!-- 添加静态熟悉面板 -->
                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加属性</el-button>
                    <!-- 静态属性表格 -->
                    <el-table :data="onlyTabData" border >
                        <!-- 展开行 -->
                        <el-table-column type="expand" >
                            <template slot-scope="scope">
                                <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" closable @close='closeTag(index,scope.row)'>
                                    {{item}}
                                </el-tag>
                                <el-input class="input-new-tag" v-if="scope.row.tagInputVisible" v-model="scope.row.tagInputValue"
                                ref="saveTagInput" size="small" 
                                @keyup.enter.native="handleInputConfirm(scope.row)"
                                @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index" label="#" ></el-table-column>
                        <el-table-column prop="attr_name" label="属性名称" ></el-table-column>
                        <el-table-column  label="操作" >
                            <template slot-scope="scope">
                            <el-button size="mini" type="primary" icon="el-icon-edit" >编辑</el-button>
                            <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>
        <!-- 添加对话框 -->
        <el-dialog :title="'添加'+titleName" :visible.sync="addDialogVisible" width="50%" @close="addDialogClear">
        <el-form ref="formRef" :model="addForm" label-width="80px" :rules="addFormRule">
            <el-form-item :label="titleName" prop="attr_name">
                <el-input v-model="addForm.attr_name"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data:function(){
        return{
            //商品分类列表
            cateList:[],
            //选择的级联选项 双向绑定
            cateSelectedKey:[],
            cateProps:{
                expandTrigger: 'hover' ,
                value:'cat_id',
                label:'cat_name',
                children:'children'
            },
            //选择的tab标签
            activeTabName:'many',
            //动态参数的数据
            manyTabData:[],
            //静态属性的数据
            onlyTabData:[],
            addDialogVisible:false,
            //添加表单的数据
            addForm:{
                attr_name:''
            },
            //添加表单校验规则
            addFormRule:{
                attr_name: [
                { required: true, message: '请输入参数名称', trigger: 'blur' }
                ]
            }
        }
    },
    created:function(){
        this.getCateList()
    },
    methods:{
        //获取所有商品分类列表
        getCateList:async function(){
            const { data: res } = await this.$axios.get('categories')
            console.log(res);
            if (res.meta.status != 200) {
                return this.$message.error('获取商品分类失败！') 
            } 
            this.cateList = res.data
        },
        //选择级联框中选择改变时触发
        cateChange:async function(){
            this.getParamsData()
            
        },
        //切换tab标签
        tabClick:function(){
            this.getParamsData()
        },
        //获取参数列表数据
        getParamsData:async function(){
            if(this.cateSelectedKey.length != 3){
                this.cateSelectedKey = []
                this.manyTabData = []
                this.onlyTabData = []
                return
            }
            //根据所选分类的id，和当前所处的面板获取对应的参数
            const {data:res} = await this.$axios.get(`categories/${this.cateID}/attributes`,
            {params:{sel:this.activeTabName}})
            if (res.meta.status !== 200) {
                return this.$message.error('获取参数列表失败！') 
            } 
            console.log(res.data);
            //这里将接收到的数据进行遍历，将里面attr_vals的字符串用' '分隔转化为数组，再赋值回去
            //这样后 此时res.data.attr_vals里面的数据格式就是数组了
            res.data.forEach((item)=>{
                if(item.attr_vals != ''){
                    item.attr_vals = item.attr_vals.split(' ')
                    
                }else{
                    //如果item.attr_vals没有内容，就设置为空数组，
                    //否则会被split方法形成一个['']，这样会形成一个空标签出来
                    item.attr_vals = []
                }
                //这里给每一组参数都单独设置了一个控制taginput和value的属性
                    //这样不同组之间的taginput就不会互相干扰了
                    item.tagInputVisible = false;
                    item.tagInputValue =''
                        
            })
            //判断当前选择的是哪个标签，从而获取不同的数据
            if(this.activeTabName == 'many'){
                this.manyTabData = res.data
            }else{
                this.onlyTabData = res.data
            }
            
        },
        //关闭添加对话框清空
        addDialogClear:function(){
            this.$refs.formRef.resetFields()
        },
        //点击按钮，添加参数
        addParams:function(){
            this.$refs.formRef.validate(async(valid)=>{
                if(!valid){
                    return this.$message.error('内容校验未通过') 
                }else{
                    const {data:res} = await this.$axios.post(`categories/${this.cateID}/attributes`,{
                        attr_name:this.addForm.attr_name,
                        attr_sel:this.activeTabName
                    })
                    if(res.meta.status != 201){
                        return this.$message.error('添加失败')
                    }
                    console.log(res);
                    this.$message.success('添加成功')
                    
                    this.addDialogVisible = false;
                    this.getParamsData()
                }
            }) 
        },
        //点击删除参数
        removeParams: function(id){
             this.$confirm('此操作将删除该参数, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async() => {
            const{data:res} = await this.$axios.delete(`categories/${this.cateID}/attributes/${id}`);
            if (res.meta.status !== 200) {
                return this.$message.error('删除失败！') 
            } 
            this.$message.success('删除成功！') 
            this.getParamsData()
            console.log(res);
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
        },
        //按下回车或者失去焦点都会触发，隐藏taginput
        handleInputConfirm:async function(row){
            if(row.tagInputValue.trim().length == 0){
                row.tagInputValue = ''
                row.tagInputVisible = false
                return
            }
            //如果输入符合规范，则添加到服务器当中
            //标签的数据是从attr_vals这个数组中取到的
            row.attr_vals.push(row.tagInputValue.trim())
            row.tagInputValue = '' 
            row.tagInputVisible = false
            //向服务器发送请求
            this.saveAttrVals(row)
        },
        //向服务器发送tag更改的请求
        saveAttrVals:async function(row){
            
            //发送请求
            const {data:res} =await this.$axios.put(`categories/${this.cateID}/attributes/${row.attr_id}`,{
                attr_name: row.attr_name,
                attr_sel: row.attr_sel,
                attr_vals:row.attr_vals.join(' ')
            })
            if (res.meta.status !== 200) {
                return this.$message.error('修改参数项失败！')
            }
            this.$message.success('修改参数项成功！')
        },
        //显示taginput
        showInput:function(row){
            row.tagInputVisible = true
            //这个$nextTick方法 的作用是当页面元素都被渲染完之后才执行
            //当上面我把这个布尔逻辑改成true时，此时页面的元素还在渲染当中
            //所以这个时候去ref找input输入框去获取焦点 就会失败，因为此时没有input

            this.$nextTick(_ => {
                //自动获取焦点
             this.$refs.saveTagInput.focus();
        });           
        },
        //删除tag标签
        closeTag:function(i,row){
            row.attr_vals.splice(i,1);
            this.saveAttrVals(row)
        }
    },
    computed:{
        //如果没有选择商品类型，则禁用按钮，返回true
        isBtnDisabled:function(){
            if(this.cateSelectedKey.length != 3){
                return true
            }else{
                return false
            }
        },
        // 当前选中的三级分类的Id
        cateID:function(){
            if(this.cateSelectedKey.length == 3){
                return this.cateSelectedKey[2]
            }else{
                return null
            }
        },
        // 获取选择的标签名字
        titleName:function(){
            if(this.activeTabName == 'many'){
                return '参数'
            }else{
                return '属性'
            }
        }
    }
}
</script>

<style lang="less" scoped>
.params{
    margin: 15px;
}
.el-tag{
    margin: 0px 15px;
}
.input-new-tag{
    width: 160px;
}
</style>