<template>
    <div>
        <p class="page-title">玻璃幕墙平整度检测</p>

        <div class="grid-container">
            <!-- 把他俩放一块儿是为了布局方便 -->
            <div class="upload-and-table-container">
                <!-- 图片上传部分 -->
                <div class="upload-container">
                    <p class="tips">请您上传一张图片</p>
                    <ImgUpload 
                        @confirmUpload="confirmUpload" 
                        @onCancel="onCancel" 
                        :disabled="uploadCompleted" 
                        v-model:visible="showUpload"
                    >
                    </ImgUpload>
                </div>

                <!-- 新增的表格 -->
                <div 
                    v-if="showResult" class="table-container" 
                    v-loading="loading"
                    element-loading-text="检测中..."
                    element-loading-background="rgb(255,255,255)"
                >
                    <p class="tips-item">可识别到的完整玻璃编号矩阵&nbsp;</p>
                    <el-table :data="tableData" border :show-header="false" class="scaled-table" >
                        <el-table-column v-for="(col, index) in cols" :key="index" align="center">
                            <template v-slot="scope">
                                {{ scope.row[index] }}
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>

            <!-- 原来的检测信息表格 -->
            <div v-if="showResult" class="result-list-container" 
                v-loading="loading"
                element-loading-text="结果拉取中..."
                element-loading-background="rgb(255,255,255)"
            >
                <p class="tips-item">不一致图片信息&nbsp;</p>

                <!-- 如果请求成功 -->
                <div v-if="postSuccess">
                    <!-- 如果有表格 -->
                    <div v-if="showTable">
                        <div class="_item">
                            <div class="_item-list" v-for="(item,index) in results.messageList" :key="index">
                                <el-link  :underline="false" @click="openImageDialog(index)">
                                    {{ item.info }}
                                </el-link>
                            </div>
                        </div>
                    </div>

                    <!-- 如果没有表格 -->
                    <div v-else>
                        <p class="result-tips-item">未检测到不一致！可认为玻璃平整！</p>
                    </div>
                    
                </div>

                <div v-else>
                    <p class="result-tips-item">获取检测结果失败！&nbsp;</p>
                </div>
            </div>

            
        </div>

        <!-- 图片弹窗 -->
        <el-dialog v-model="dialogVisible" title="图片详情" width="60%">
            <img :src="dialogImageUrl" style="width: 100%" />
        </el-dialog>
    </div>
</template>
  
<script setup>
import ImgUpload from '@/components/ImgUpload.vue'
import { ref } from 'vue'
import axios from '@/axios'
import { ElMessage } from 'element-plus';

// 初始化结果结构
const structure = {
    messageList: [],
    photoURL: [],
};

const results = ref({ ...structure });
const uploadCompleted = ref(false);
const showResult = ref(false); // 是否展示结果列表
const postSuccess = ref(false); // 获取结果是否成功
const showTable = ref(false); // 是否展示结果列表

const loading = ref(false);
const dialogVisible = ref(false);
const baseUrl = process.env.VUE_APP_IMG_BASE_URL;

const tableData = ref([]);

const cols = ref(0);
const rows = ref(0);
const confirmUpload = async (file) => {
    uploadCompleted.value = true;
    showResult.value = true;
    loading.value = true;
    const formData = new FormData();
    formData.append('photo', file.fileList[0].raw);

    try {
        const res = await axios.post('/flatDetect/', formData);
        if (res.status === 200) {
            console.log("res.data:",res.data);
            // 请求成功
            postSuccess.value = true;

            // 设置表格数据
            cols.value = res.data.col;
            rows.value = res.data.row;
            // 先创建一个二维数组
            tableData.value = Array.from({ length: rows.value }, 
                () => Array.from({ length: cols.value }));

            for (let colIndex = 0; colIndex < cols.value; colIndex++) {
                for (let rowIndex = 0; rowIndex < rows.value; rowIndex++) {
                    tableData.value[rowIndex][colIndex] = colIndex * rows.value + rowIndex +1 ;
                }
            }

            if (res.data.messageList !== []) {
                // 就算row和column有值，photoURL不一定有值；算法可以识别的只有完整的玻璃数
                results.value.messageList = res.data.messageList.map((element, index) => ({ 
                    seq: index, 
                    info: element, 
                    hover: false 
                }));
                console.log("数组：",results.value.messageList)
                results.value.photoURL = res.data.photoURL;
                console.log(results.value);
                showTable.value = true; // 可以展示表格
            } else {
                // 否则不渲染不一致信息表格
                showTable.value = false;
            }
            
            loading.value = false; // 取消遮罩
            
        } else {
            ElMessage({ message: '服务器状态码错误！', type: 'warning' });
            loading.value = false;
        }
    } catch (e) {
        ElMessage({ message: '请求失败！', type: 'error' });
        console.log(e);
        loading.value = false;
    }
};

const dialogImageUrl = ref('');

const openImageDialog = (seq) => {
    const index = seq; // 检测信息序号和图片序号相同
    dialogImageUrl.value = baseUrl + results.value.photoURL[index];
    dialogVisible.value = true;
};

const onCancel = () => {
    console.log("您取消了上传");
    showResult.value = false;
    postSuccess.value = false;
    showTable.value = false;
    results.value = { ...structure };
    uploadCompleted.value = false;
};
</script>

<style scoped>
.table-container {
    width: 500px;
}
.page-title {
    font-size: 24px; /* 设置标题字体大小 */
    font-weight: bold; /* 设置标题粗细 */
    text-align: center; /* 居中对齐 */
    margin-bottom: 20px; /* 下方间距 */
}

.grid-container {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0px;
    justify-content: center;
}

.upload-and-table-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-start; /* 控制组件上下对齐 */
}

.upload-container {
    flex: 1; /* 使上传组件自动填充剩余空间 */
}

.table-container {
    display: flex; /* 确保是 flex 容器 */  
    flex-direction: column; 
    align-items: center; /* 垂直居中 */  
    justify-content: center;
    max-width: 400px; /* 设置一个适当的最大宽度 */

    /* 添加边框让他好看一点.. */
    border: 1px solid #4f636f; /* 边框颜色和粗细 */
    border-radius: 15px; /* 圆角 */
    box-shadow: 0 4px 8px rgba(73, 71, 71, 0.463); /* 阴影 */
    padding: 10px; /* 内边距 */
}


.result-list-container {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    width: 95%;
    margin: 20px auto;

    /* 添加边框 */
    border: 1px solid #4f636f; /* 边框颜色和粗细 */
    border-radius: 15px; /* 圆角 */
    box-shadow: 0 4px 8px rgba(73, 71, 71, 0.463); /* 阴影 */
    padding: 10px 20px; /* 内边距 */
}

.el-table {
    margin-top: 20px;
    border-bottom: 1px solid #000;
    border-right: 1px solid #000;
    border-left: 1px solid #000;
    border-top: 1px solid #000;
    margin: 0 auto;
}

/deep/.el-table th {
    border: 1px solid #000;
    border-right: none;
    border-bottom: none;
}

/deep/.el-table td {
    border: 1px solid #000;
    border-right: none;
    border-bottom: none;
}

/**改变表头标题颜色*/
 /deep/.el-table thead {
    color: #000;
}

/* 应该是害怕弹窗的尺寸过大 */
.el-dialog {
    max-height: 80vh !important;
}

.tips {
    text-align: center;
}

._item{
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
    border: 1px solid #6d829d;
}

._item-list{
    width: 33.33333333%;
    height: 35px;
    border: 1px solid #839ab8;
    padding: 6px;
    box-sizing: border-box;
}

.table-container .scaled-table {
  transform: scale(0.8); /* 缩小表格 */
  transform-origin: top; /* 设置缩放的原点 */
}

.tips-item {
    font-weight: bolder;
    display: inline-block;
    font-size: 15px;
}

.result-tips-item {
    display: inline-block;
    font-size: 15px;
    font-style:italic;
}
</style>
  