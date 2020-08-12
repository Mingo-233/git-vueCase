<template>
    <div>
         <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>数据统计</el-breadcrumb-item>
            <el-breadcrumb-item>数据报表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card >
            <!-- 2.为echart准备一个具备大小（宽高）的dom -->
            <div id="main" style="width: 800px;height:400px;"></div>
        </el-card>
    </div>
</template>

<script>
//1.导入echarts
import echarts from 'echarts'
//lodash是一个一致性、模块化、高性能的 JavaScript 实用工具库
import _ from 'lodash'
export default {
    data:function(){
        return{
            options: {
            title: {
                text: '用户来源'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                type: 'cross',
                label: {
                    backgroundColor: '#E9EEF3'
                }
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: [
                {
                boundaryGap: false
                }
            ],
            yAxis: [
                {
                type: 'value'
                }
            ]
            }
        }
    },
    //mounted 此时页面上的元素，已经被渲染完毕
    mounted:async function(){
        // 3.基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(document.getElementById('main'));

        const{data:res} = await this.$axios.get('reports/type/1')
        console.log(res);
        if(res.meta.status != 200){
            return this.$message.errot('获取数据失败')
        }

        // 4.指定图表的配置项和数据
        //合并2份数据
        const result = _.merge(res.data,this.options)

        // 5.使用刚指定的配置项和数据显示图表。
        myChart.setOption(result);
    }
}
</script>

<style lang="less" scoped>

</style>