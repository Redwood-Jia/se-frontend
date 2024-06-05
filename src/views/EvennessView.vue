<template>
    <div>
        <p class="page-title">玻璃幕墙平整度检测</p>

        <div class="grid-container">
            <!-- 图片上传部分 -->
            <div class="upload-container">
                <p class="tips">请您上传一张图片</p>
                <ImgUpload 
                    @confirmUpload="confirmUpload"
                    @onCancel="onCancel"
                    :disabled="uploadCompleted"
                >
                </ImgUpload>
            </div>

            <!-- 结果展示部分 -->
            <div v-if="showResult" class="result-list-container" v-loading="loading">
                <el-divider></el-divider>
                <div class="default" v-if="success">
                    <!-- 整体结果展示 -->
                    <div class="overall-result-container">
                        <p class="sub-tips-item">检测结果&nbsp;</p>
                         <!-- 添加提示信息 -->
                        <p class="sequence-info">(按从上往下，从左往右的顺序进行玻璃序号计数)</p>
                    </div>
                    
                    <!-- 详细结果展示 -->
                    <div class="detail-container">
                        <div class="photo-display-container">
                            <img :src="currentImageUrl" class="photo-display-img" @mousemove="GetMousePos">
                        </div>

                        <div class="tip-info-container">
                            <div class="img-result-container">
                                <div>{{ currentImageText }}</div>
                            </div>
                        </div>

                        <div class="mouse-pos-container">
                            <div>X = {{ mouseX }}, Y = {{ mouseY }}</div>
                        </div>

                        <div class="button-container">
                            <el-button @click="prevImage">上一张</el-button>
                            <el-button @click="nextImage">下一张</el-button>
                        </div>
                    </div>


                    <!-- 表格展示所有不一致的图片信息 -->
                    <el-table :data="results.badmessage" border style="width: 90%">
                        <el-table-column prop="seq" label="序号" width="180" align="center"/>
                        <el-table-column prop="info" label="信息" align="center"/>
                    </el-table>
                </div>

                <!-- 如果没有成功获取结果，显示缺省组件 -->
                <div v-else>
                    <p>没有拿到结果</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import ImgUpload from '@/components/ImgUpload.vue'
import { ref, computed, watch } from 'vue'
import axios from '@/axios'
import { ElMessage } from 'element-plus';

// 初始化结果结构
const structure = {
    messageList: [],
    photoURL: [],
    badmessage: [],
};

const results = ref({ ...structure });
const uploadCompleted = ref(false);
const showResult = ref(false);
const loading = ref(false);
const success = ref(false);
const baseUrl = process.env.VUE_APP_IMG_BASE_URL;

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
            results.value.messageList = res.data.messageList;
            results.value.photoURL = res.data.photoURL;
            results.value.badmessage = res.data.badmessage.map((element, index) => ({
                seq: index,
                info: element,
            }));
            console.log(results.value);
            loading.value = false;
            success.value = true;

            // 预加载当前和下一张图片
            preloadImage(currentImageIndex.value);
            preloadImage(currentImageIndex.value + 1);
        } else {
            ElMessage({
                message: '服务器状态码错误！',
                type: 'warning',
            });
            loading.value = false;
        }

    } catch (e) {
        ElMessage({
            message: '请求失败！',
            type: 'error',
        });
        console.log(e);
        loading.value = false;
    }
};

const currentImageIndex = ref(0);

const currentImageUrl = computed(() => {
    return results.value.photoURL[currentImageIndex.value]
        ? `${baseUrl}${results.value.photoURL[currentImageIndex.value]}`
        : '';
});

const currentImageText = computed(() => results.value.messageList[currentImageIndex.value]);

const prevImage = () => {
    if (currentImageIndex.value > 0) {
        currentImageIndex.value--;
        preloadImage(currentImageIndex.value - 1); // 预加载前一张图片
    }
};

const nextImage = () => {
    if (currentImageIndex.value < results.value.photoURL.length - 1) {
        currentImageIndex.value++;
        preloadImage(currentImageIndex.value + 1); // 预加载下一张图片
    }
};

const mouseX = ref(null);
const mouseY = ref(null);
const GetMousePos = (e) => {
    mouseX.value = e.offsetX;
    mouseY.value = e.offsetY;
};

const onCancel = () => {
    console.log("您取消了上传");
    showResult.value = false;
    results.value = { ...structure };
    currentImageIndex.value = 0;
    uploadCompleted.value = false;
};

// 预加载图片函数
const preloadImage = (index) => {
    if (results.value.photoURL[index]) {
        const img = new Image();
        img.src = `${baseUrl}${results.value.photoURL[index]}`;
    }
};

// 监听图片索引变化，确保预加载当前图片和下一张图片
watch(currentImageIndex, (newIndex) => {
    preloadImage(newIndex);       // 预加载当前图片
    preloadImage(newIndex + 1);   // 预加载下一张图片
});
</script>


<style lang="scss" scoped>
.page-title {
    font-size: 24px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 20px;
}

.grid-container {
    display: grid;
    grid-template-columns: 1fr; // 声明列的宽度
    // grid-template-rows: 2fr; // 声明行的宽度
    gap: 20px; // 每列之间的间距
    // grid-template-areas: 
    //     "imgUpload result result"
    //     "result   result result";
    justify-content: center;
}

.tips {
    display: flex;
    text-align: center;
    justify-content: center;
}

.upload-container {
    // grid-area: imgUpload;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.default {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.result-list-container {
    // grid-area: result;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    width: 95%;
    margin: 0 auto;
}

.detail-container {
    display: grid;
    grid-gap: 10px;
    grid-template-areas: 
        "img text text"
        "img mouse button";
    // display: flex; /* 将容器设置为 Flexbox 布局 */
    align-items: center; /* 垂直居中对齐 */
    justify-content: flex-start; /* 水平左对齐 */

    // .photo-display-container {
    //     flex: 1; /* 让图片容器自动填充剩余空间 */
    // }

    // .tip-info-container {
    //     flex: 1; /* 让检测信息容器自动填充剩余空间 */
    // }
}

.mouse-pos-container {
    grid-area: mouse;
    margin: 0 5px 5px 0; // 上右下左
}

.button-container {
    grid-area: button;
    margin: 0 0 5px 5px; 
}


.photo-display-container {
    grid-area: img;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start; /* 左对齐 */
    padding: 10px;
    box-sizing: border-box;

    img {
        max-width: 700px; /* 设置图片最大宽度 */
        width: auto; /* 自适应宽度 */
        height: auto; /* 自适应高度 */
    }
}

.tip-info-container {
    grid-area: text;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .img-result-container, .mouse-pos-container, .button-container {
        display: flex;
        justify-content: center;
        align-items: center;
    }
}

.sub-tips-item {
    font-weight: bolder;
    display: inline-block;
}

.sequence-info {
    font-size: 14px;
    color: #888;
    text-align: center;
    // margin-top: 5px;
    display: inline-block;
    font-style: italic;
}
</style>