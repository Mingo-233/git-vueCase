<template>
    <div>
         <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card >
            <el-button type="primary" @click="showAddCateDialog"> 添加商品 </el-button>

            <!-- 表格 -->
            <tree-table :data='cateList' :columns='columns' :show-index='true' index-text='#'
            border  :expand-type='false' :selection-type='false' class="treeTable">
                <!-- 是否有效 -->
                <template slot="isok" slot-scope="slotProps">
                    <i class="el-icon-success" style="color:lightgreen"
                    v-if="slotProps.row.cat_deleted == false"></i>
                    <i class="el-icon-erroe" v-else style="color:red" ></i>
                </template>
                <!-- 排序 -->
                <template slot="order" slot-scope="slotProps">
                    <el-tag v-if="slotProps.row.cat_level == 0">一级</el-tag>
                    <el-tag v-else-if="slotProps.row.cat_level == 1" type="success">二级</el-tag>
                    <el-tag v-else type="warning">三级</el-tag>
                </template>
                <!-- 操作 -->
                    <template slot="operate" slot-scope="slotProps">
                        <el-button type="primary" class="el-icon-edit" size="small">编辑</el-button>
                        <el-button type="danger" class="el-icon-delete" size="small" @click="removeCate(slotProps.row)">删除</el-button>
                </template>
            </tree-table>
            <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[3, 5, 8, 10]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
        </el-card>
            <!-- 添加分类的对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" 
    @close="addDialogClear" >
      <!-- 添加分类的表单 -->
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：" >
          <!-- options 用来指定数据源 -->
          <!-- props 用来指定配置对象 -->
          <el-cascader
            v-model="selectKeys"
            :options="parentCateList"
            :props=" cascaderProps "
            @change="parentCateChanged" clearable >
            </el-cascader>
        </el-form-item>
      </el-form>
      <span >
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    </div>
</template>

<script>
export default {
    data:function(){
        return{
            //查询条件
            queryInfo:{
                type:3,
                pagenum:1,
                pagesize:5
            },
            //商品分类的数据列表
            cateList:[],
            total:0,
            //表格各列的配置 Columns Configs
            columns:[{
                label:'分类名称',
                prop:'cat_name'
                 },
                {
                    label:'是否有效',
                    //表示 将当前列设置为模板列
                    type:'template',
                    //设置模板名称
                    template:'isok'
                },
                {
                    label:'排序',
                    //表示 将当前列设置为模板列
                    type:'template',
                    //设置模板名称
                    template:'order'
                },
                {
                    label:'操作',
                    type:'template',
                    template:'operate'
                }
            ],
            // 控制添加分类对话框的显示与隐藏
            addCateDialogVisible: false,
            // 添加分类的表单数据对象
            addCateForm: {
                // 将要添加的分类的名称
                cat_name: '',
                // 父级分类的Id
                cat_pid: 0,
                // 分类的等级，默认要添加的是1级分类
                cat_level: 0
            },
            // 添加分类表单的验证规则对象
            addCateFormRules: {
                cat_name: [
                { required: true, message: '请输入分类名称', trigger: 'blur' }
                ]
            },
            //父级分类列表
            parentCateList:[],
            // 选中的父级分类的Id数组
            selectKeys:[],
            // 指定级联选择器的配置对象
              //checkStrictly控制是否父子节点不互相关联（可以单独选择
              //二级菜单，否则只能选择最后一级菜单{三级菜单}）
            cascaderProps: {
                expandTrigger: 'hover' ,
                value: 'cat_id',
                label: 'cat_name',
                children: 'children',
                checkStrictly:true
            },
        }
    },
    created:function(){
        this.getCateList()
    },
    methods:{
        //获取商品分类数据列表
        getCateList:async function(){
            const {data:res} = await this.$axios.get('categories',{params:this.queryInfo})
            if (res.meta.status !== 200) {
                    return this.$message.error('获取商品分类数据失败！')
            }
            
            //获取商品分类数据
            this.cateList = res.data.result
            this.total = res.data.total
        },
        //监听每页显示数据条数
        handleSizeChange:function(val){
            this.queryInfo.pagesize = val
            this.getCateList()
        },
        //监听当前页
        handleCurrentChange:function(val){
            this.queryInfo.pagenum = val
            this.getCateList()
        },
        // 点击按钮，展示添加分类的对话框
        showAddCateDialog:function(){
            // 先获取父级分类的数据列表
            this.getParentCateList()
            // 再展示出对话框
            this.addCateDialogVisible = true;
        },
        // 获取父级分类的数据列表
        getParentCateList:async function(){
            const { data: res } = await this.$axios.get('categories', {
                params: { type: 2 }
            })
            if (res.meta.status !== 200) {
                return this.$message.error('获取父级分类数据失败！')
            }
            console.log(res.data)
            this.parentCateList = res.data
        },
        //选择项发生变化触发这个函数
        parentCateChanged:function(){
            console.log(this.selectKeys);
            // 如果 selectedKeys 数组中的 length 大于0，证明选中的父级分类
            // 反之，就说明没有选中任何父级分类
            if(this.selectKeys.length > 0){
                // 获取 分类的Id ,父级id是数组中的第一位
                //而最后后面的分类，他的id是存储在数组的最后一位
                this.addCateForm.cat_pid = this.selectKeys[this.selectKeys.length-1]
                //为当前分类的等级赋值 1 or 2
                this.addCateForm.cat_level = this.selectKeys.length
                return
            }else{
                // 父级分类的Id
                this.addCateForm.cat_pid = 0
                // 为当前分类的等级赋值
                this.addCateForm.cat_level = 0
            }
        },
        //点击按钮，添加新的分类
        addCate:function(){
            console.log(this.addCateForm);
            this.$refs.addCateFormRef.validate(async valid=>{
                if(!valid) return
                const {data:res} = await this.$axios.post('categories',this.addCateForm)
                console.log(res);
                if (res.meta.status !== 201) {
                 return this.$message.error('添加分类失败！')
                }
                this.$message.success('添加分类成功！')
                this.getCateList()
                this.addCateDialogVisible = false
            })
        },
        //退出添加分类的对话框时，清空数据
        addDialogClear:function(){
            this.$refs.addCateFormRef.resetFields()
            this.selectKeys = []
            this.addCateForm.cat_pid = 0
            this.addCateForm.cat_level = 0
        },
        //删除分类
        removeCate:async function(cat){
            const id = cat.cat_id
            const {data:res} = await this.$axios.delete(`categories/${id}`);
            console.log(res);
            if (res.meta.status !== 200) {
                 return this.$message.error('删除失败！')
            }
            this.$message.success('删除成功！')
            this.getCateList()
        }
    }
}
</script>

<style lang="less" scoped>
.treeTable{
    margin: 15px;
}
.el-cascader{
    width: 100%;
}
</style>