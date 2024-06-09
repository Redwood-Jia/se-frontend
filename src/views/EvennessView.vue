<template>
    <div>
      <p class="page-title">玻璃幕墙平整度检测</p>
      <div class="grid-container">
        <div class="upload-and-table-container">
          <!-- 图片上传部分 -->
          <div class="upload-container">
            <p class="tips">请您上传一张图片</p>
            <ImgUpload @confirmUpload="confirmUpload" @onCancel="onCancel" :disabled="uploadCompleted" v-model:visible="showUpload">
            </ImgUpload>
          </div>
          <!-- 新增的表格 -->
          <div v-if="showResult" class="table-container" v-loading="loading" element-loading-text="检测中...">
          <el-table :data="tableData" border :show-header="false" class="scaled-table">
            <el-table-column v-for="(col, index) in cols" :key="index" align="center">
              <template v-slot="scope">
                {{ scope.row[index] }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
        <!-- 原来的检测信息表格 -->
        <div v-if="showResult" class="result-list-container" v-loading="loading">
          <el-divider></el-divider>
          <!-- 表格展示所有不一致的图片信息 -->
  <!-- 新增 start -->
  <p class="sub-tips-item">检测结果&nbsp;</p>
<div class="_item">
<div class="_item-list" v-for="(item,index) in results.messageList" :key="index">
    <el-link  :underline="false" @click="openImageDialog(index)">{{ item.info }}</el-link>
</div>
</div>
  <!-- 新增 end -->

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
  const showResult = ref(false);
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
        console.log(res.data);
      // 设置表格数据
      cols.value = res.data.col;
      rows.value = res.data.row;
      tableData.value = Array.from({ length: rows.value }, () => Array.from({ length: cols.value }));
      for (let colIndex = 0; colIndex < rows.value; colIndex++) {
        for (let rowIndex = 0; rowIndex < rows.value; rowIndex++) {
          tableData.value[rowIndex][colIndex] = colIndex * rows.value + rowIndex;
        }
      }
      results.value.messageList = res.data.messageList.map((element, index) => ({ seq: index, info: element, hover: false }));
      console.log("数组：",results.value.messageList)
      results.value.photoURL = res.data.photoURL;
      console.log(results.value);
      loading.value = false;
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
    results.value = { ...structure };
    uploadCompleted.value = false;
  };
  </script>
  
  <style scoped>
  .page-title {
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 20px;
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
    flex: 1; /* 使表格自动填充剩余空间 */
  }
  

  .result-list-container {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    width: 95%;
    margin: 0 auto;
  }
  
  .el-table {
    margin-top: 20px;
  }
  
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
    border: 1px solid #f1f1f1;
  }

  ._item-list{
    width: 33.33333333%;
    height: 35px;
    border: 1px solid #f1f1f1;
    padding: 6px;
    box-sizing: border-box;
  }

  .table-container .scaled-table {
  transform: scale(0.8); /* 缩小表格 */
  transform-origin: top left; /* 设置缩放的原点 */
}

.sub-tips-item {
    font-weight: bolder;
    display: inline-block;
    font-size: 15px;
}
  </style>
  