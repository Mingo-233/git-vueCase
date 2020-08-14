<template>
    <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <el-steps :active="activeIndex-0" finish-status="success" :align-center="true">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
    </el-steps>
    <!-- tab标签区域 -->
    <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs v-model="activeIndex" tab-position="left" :before-leave="beforeTabLeave" @tab-click="tabClicked">
            <el-tab-pane label="基本信息" name="0">
              <el-form-item label="商品名称" prop="goods_name">
                <el-input v-model="addForm.goods_name"></el-input>
              </el-form-item>
              <el-form-item label="商品价格" prop="goods_price">
                <el-input v-model="addForm.goods_price" type="number"></el-input>
              </el-form-item>
              <el-form-item label="商品重量" prop="goods_weight">
                <el-input v-model="addForm.goods_weight" type="number"></el-input>
              </el-form-item>
              <el-form-item label="商品数量" prop="goods_number">
                <el-input v-model="addForm.goods_number" type="number"></el-input>
              </el-form-item>
              <el-form-item label="商品分类" prop="goods_cat">
                <el-cascader v-model="addForm.goods_cat" :options="catelist"
                    :props="cateProps" @change="cateChange">
                    </el-cascader>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品参数" name="1">
                <!-- 渲染表单的Item项 -->
                <el-form-item v-for="item in manyTableData" :key="item.attr_id" :label="item.attr_name">
                    <el-checkbox-group v-model="item.attr_vals">
                        <el-checkbox :label="it" v-for="(it,index) in item.attr_vals" :key="index" border></el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品属性" name="2">
              <el-form-item v-for="item in onlyTableData" :key="item.attr_id" :label="item.attr_name">
                <el-input v-model="item.attr_vals"></el-input>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品图片" name="3">
              <el-upload
                :headers="headerObj"
                action="http://127.0.0.1:8888/api/private/v1/upload"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :on-success="handleSuccess"
                list-type="picture">
                <el-button size="small" type="primary">点击上传</el-button>
                <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
              </el-upload>
            </el-tab-pane>
            <el-tab-pane label="商品内容" name="4">
                <quill-editor v-model="addForm.goods_introduce" ></quill-editor>
                <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
            </el-tab-pane>
            
        </el-tabs>

    </el-form>
    </el-card>
    <!-- 对话框 -->
    <el-dialog
      title="预览图片"
      :visible.sync="dialogVisible"
      width="50%">
      
      <img :src="previewPath" alt="" width="100%">
    </el-dialog>

    </div>
</template>

<script>
import _ from 'lodash'
export default {
    data() {
        return {
        activeIndex: '0',
        // 添加商品的表单数据对象
        addForm: {
            goods_name: '',
            goods_price: 0,
            goods_weight: 0,
            goods_number: 0,
            // 商品所属的分类数组
            goods_cat: [],
            //图片的数组
            pics:[],
            //商品的文字详情描述
            goods_introduce:'',
            //这是存放提交时候的动静态数据
            attrs: []
        },
        addFormRules: {
            goods_name: [
            { required: true, message: '请输入商品名称', trigger: 'blur' }
            ],
            goods_price: [
            { required: true, message: '请输入商品价格', trigger: 'blur' }
            ],
            goods_weight: [
            { required: true, message: '请输入商品重量', trigger: 'blur' }
            ],
            goods_number: [
            { required: true, message: '请输入商品数量', trigger: 'blur' }
            ],
            goods_cat: [
            { required: true, message: '请选择商品分类', trigger: 'blur' }
            ]
        },
        // 商品分类列表
        catelist: [],
        cateProps: {
            expandTrigger: 'hover' ,
            label: 'cat_name',
            value: 'cat_id',
            children: 'children'
        },
        // 动态参数列表数据
        manyTableData: [],
        // 静态属性列表数据
        onlyTableData: [],
        //设置图片上传的请求头文件
        headerObj:{
          Authorization:window.sessionStorage.getItem('token')
        },
        previewPath:'',
        dialogVisible:false
        }
    },
    created() {
        this.getCateList()
    },
    methods: {
    // 获取所有商品分类数据
    async getCateList() {
      const { data: res } = await this.$axios.get('categories')

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败！')
      }

      this.catelist = res.data
      console.log(this.catelist)
     },
    // 级联选择器选中项变化，会触发这个函数
    cateChange() {
      console.log(this.addForm.goods_cat)
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    beforeTabLeave(activeName, oldActiveName){
        if(oldActiveName == '0' && this.addForm.goods_cat.length != 3){
            this.$message.error('请先选择商品分类')
            //返回false将阻止tab标签跳转
            return false
        }
    },
    //点击左边的标签触发
    async tabClicked(){
        // 证明访问的是动态参数面板
        if (this.activeIndex === '1') {
        const { data: res } = await this.$axios.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'many' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败！')
        }   
        res.data.forEach(item=>{
            item.attr_vals = item.attr_vals.length == 0 ? []: item.attr_vals.split(' ')
        })
         this.manyTableData = res.data
        console.log(res.data)
        }else if (this.activeIndex === '2') {
        const { data: res } = await this.$axios.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'only' }
          }
        )

        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性失败！')
        }

        console.log(res.data)
        this.onlyTableData = res.data
      }
    },
    //处理图片预览
    handlePreview(file){
      this.previewPath = file.response.data.url;
      this.dialogVisible = true
    },
    //处理图片移除
    handleRemove(file){
      //1获取要移除图片的临时路径
      const filePath = file.response.data.tmp_path
      //2找到这个路径在pics数组中的索引
       const i = this.addForm.pics.findIndex((item)=>{
        return item.pic == filePath
      })
      //3在数组中删除它
      this.addForm.pics.splice(i,1)
      console.log(this.addForm);
    },
    //监听图片上传成功的事件 
    handleSuccess(response){
      //response当中有上传的信息tmp_path图片临时路径，还有服务器完整的url地址
      // console.log(response);
      //1拼接得到一个图片信息对象
      const picInfo ={pic:response.data.tmp_path}
      //2把它 push到pics数组中
      this.addForm.pics.push(picInfo) 
      console.log(this.addForm);
    },
    // 添加商品
    add(){
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项！')
        }
        //form的位置本来是 this.addForm，但是因为这个数据是双向绑定的，在级联选择框中也用到了
        // 如果这边转化为字符串，那么就会影响到那边，会报错。所以我们这里使用深拷贝，复制出一个完全不相关的
        // 执行添加的业务逻辑 lodash   cloneDeep(obj)
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = { 
           attr_id: item.attr_id,
           attr_value: item.attr_vals }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        console.log(form)
        // 发起请求添加商品
        // 商品的名称，必须是唯一的
        const { data: res } = await this.$axios.post('goods', form)

        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败！')
        }
        console.log(res);
        this.$message.success('添加商品成功！')
        this.$router.push('/goods')
    })
    }

    },
    computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.el-steps{
    margin-top: 15px;
}

.btnAdd {
  margin-top: 15px ;
}
</style>