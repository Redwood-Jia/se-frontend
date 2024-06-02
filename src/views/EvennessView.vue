<template>
    <div>
        <p class="page-title">玻璃幕墙平整度检测</p>
        <p class="tips">请您上传一张图片</p>
        <ImgUpload 
            @confirmUpload="confirmUpload"
            @onCancel="onCancel"
        >
        </ImgUpload>

        <div 
            class="result-list-container"
            v-if="showResult"
            v-loading="loading"
        >
            <br/>
            <div 
                class="default"
                v-if="success">
                <!-- 第一行展示整体结果 -->
                <el-row>
                    <p class="sub-tips-item">检测结果:&nbsp;</p>
                    <p style="display: inline-block;">{{ results.status }}</p>
                </el-row>
                <el-divider class="divider"/>
                <!-- 第二行展示裁剪后的图片 -->
                <el-row>
                    <div class="photo-display-container">
                        <img :src="currentImageUrl" class="photo-display-img">
                        <p>{{ currentImageText }}</p>
                    </div>
                </el-row>
                <!-- 按钮区域 -->
                <el-row>
                    <el-button @click="prevImage">上一张</el-button>
                    <el-button @click="nextImage">下一张</el-button>
                </el-row>
            </div>
            <!-- 如果没能成功拿到结果，显示缺省组件 -->
            <div v-else>
                <p>没有拿到结果</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import ImgUpload from '@/components/ImgUpload.vue'
import { ref, computed } from 'vue'
import axios from '@/axios'
import { ElMessage } from 'element-plus';

// 定义一个结果返回结构
const structure = {
  status: '', // 整体结果
  details: [
    {
      img: '', // 图片URL
      info: ''
    }
  ]
};

const results = ref({...structure}); // '...'指浅拷贝
const showResult = ref(false); // 决定是否展示结果框
const baseUrl = process.env.VUE_APP_IMG_BASE_URL;

// 在未显示结果时显示“加载图标”
// 提高用户体验
const loading = ref(true); 
const success = ref(true);

// 确认上传
const confirmUpload = async (file) => {
    uploadCompleted.value = true;  // 设置为true，禁用按钮
    showResult.value = true;
    loading.value = true;

    const formData = new FormData();
    formData.append('photo', file.fileList[0].raw);

    try {
        const res = await axios.post('/flat', formData);
        
        if(res.status === 200) {
            results.value.status = res.data.status;
            results.value.details = res.data.details;
        } else {
            ElMessage({
                message: '服务器状态码错误！',
                type: 'warning',
            })
            loading.value = false;
        }
    } catch (e) {
        ElMessage({
            message: '请求失败！',
            type: 'error',
        });
        console.log(e);
    }
};

const currentImageIndex = ref(0);
// 绑定当前图片信息
const currentImageInfo = computed(
    () => results.value.details[currentImageIndex]
);
// 绑定当前图片路径
const currentImageUrl = computed(() => {
  if (currentImageInfo.value) {
    return `${baseUrl}${currentImageInfo.value.img}`;
  }
  return '';
});
// 绑定当前图片提示文字
const currentImageText = computed(() => currentImageInfo.value.text);

// 切换到上一张图片
const prevImage = () => {
    if (currentImageIndex.value > 0) {
        currentImageIndex.value--;
    }
}

// 切换到下一张图片
const nextImage = () => {
    if (currentImageIndex.value < results.value.details.length - 1) {
        currentImageIndex.value++;
    }
}

// 更换了想要检测的图片
const onCancel = () => {
    ElMessage({
        message: '您清空了图片输入',
        type: 'warning',
    })
    showResult.value = false; // 将刚才拿到的结果清空
    results.value = {
        textTip:'',
        imgURL:[]
    }
    currentImageIndex.value = 0;
}

</script>


<style lang="scss" scoped>
.tips {
    display: flex;
    text-align: center;
    justify-content: center;
}

.divider {
    margin: 9px;
}

// 展示结果的盒子
.result-list-container {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    width: 90%;
    margin: 0 auto; /* 居中对齐并给予边距 */
}

.photo-display-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 10px;
    box-sizing: border-box;
}

.photo-display-img {
    width: 150px; /* 调整图片宽度 */
    height: auto;
    margin-right: 10px; /* 图片右边距 */
}

.sub-tips-item {
    font-weight: bolder;
    display: inline-block;
}

.page-title {
    font-size: 24px; /* 设置标题字体大小 */
    font-weight: bold; /* 设置标题粗细 */
    text-align: center; /* 居中对齐 */
    margin-bottom: 20px; /* 下方间距 */
}
</style>
