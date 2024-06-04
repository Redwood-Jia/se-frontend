<template>
    <div>
        <!-- img上传后过渡到左侧 -->
        <p class="page-title">玻璃幕墙平整度检测</p>
        
        <!-- 这个transition失败是因为按官访文档，至少应该配合v-if/v-show使用 -->
        
        <!-- 使用grid确定两行布局;且第一行仅1&2 -->
        <div style="
            display: grid;
            grid-auto-flow: row ;"
        >
            <!-- flexbox2-1:flexbox1的子flex，包含两列 -->
            <div >
                <div
                    class="upload-container"
                    :class="{'move-left' : success}"
                >
                    <p class="tips">请您上传一张图片</p>
                    <ImgUpload 
                        @confirmUpload="confirmUpload"
                        @onCancel="onCancel"
                        :disabled="uploadCompleted"
                    >
                    </ImgUpload>
                </div>
            

                <div 
                    class="result-list-container"
                    v-if="showResult"
                    v-loading="loading"
                    :class="{'move-right' : success}"
                >
                    <br/>
                    <div 
                        class="default"
                        v-if="success"
                    >
                        <!-- 第一行展示整体结果 -->
                        <div class="overall-result-container">
                            <p class="sub-tips-item">检测结果:&nbsp;</p>
                            <p style="display: inline-block;">{{ results.textTip }}</p>
                        </div>
                        
                        <!-- 第二行：
                            sub-line-1：图片
                            sub-line-2：鼠标位置提示+详细结果+按钮区域 
                        -->
                        <div class="detail-container">
                            <div class="photo-display-container">
                                <img :src="currentImageUrl" class="photo-display-img"
                                @mousemove="GetMousePos">
                            </div>

                            <div class="tip-info-container">
                                <div class="img-result-container">
                                    <div>{{ currentImageText }}</div>
                                </div>

                                <div class="mouse-pos-container">
                                    <div>X = {{ mouseX }}, Y = {{ mouseY }}</div>
                                </div>
                                <div class="botton-container">
                                    <el-button @click="prevImage">上一张</el-button>
                                    <el-button @click="nextImage">下一张</el-button>
                                </div>
                            </div> 
                        </div>

                        <!-- 第三行：表格展示所有不一致的图片信息 -->
                        <el-table :data="results.badmessage" border style="width: 100%">
                            <el-table-column prop="No." label="seq" width="180" />
                            <el-table-column prop="address" label="info" />
                        </el-table>
                    </div>
                </div>

                <!-- 如果没能成功拿到结果，显示缺省组件 -->
                <div v-else>
                    <p>没有拿到结果</p>
                </div>
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
    messageList:[],
    photoURL:[],
    badmessage:[
        {
            seq:0,
            info:'',
        }
    ],
};

const results = ref({...structure}); // '...'指浅拷贝
const uploadCompleted = ref(false);  // 标志变量，控制按钮显示和隐藏
const showResult = ref(false); // 决定是否展示结果框

// 在未显示结果时显示“加载图标”
// 提高用户体验
const loading = ref(true); 
const success = ref(true);
const baseUrl = process.env.VUE_APP_IMG_BASE_URL;

// 确认上传
const confirmUpload = async (file) => {
    uploadCompleted.value = true;  // 设置为true，禁用按钮
    showResult.value = true;
    loading.value = true;

    const formData = new FormData();
    formData.append('photo', file.fileList[0].raw);

    try {
        
        const res = await axios.post('/flatDetect/', formData);
        
        if(res.status === 200) {
            console.log(res.data);
            results.value.messageList = res.data.messageList;
            results.value.photoURL = res.data.photoURL;
            // 将返回的badmessage整理成表格数据；我觉得这种数据整理写到这里其实并不好,但这应该是好想到底一种方式
            res.data.badmessage.forEach((element,index) => {
                results.value.badmessage[index].seq = index;
                results.value.badmessage[index].info = element;
            });
            console.log(results.value);
            loading.value = false;
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

// 绑定当前图片路径
const currentImageUrl = computed(() => {
  if (results.value.photoURL[currentImageIndex.value]) {
    let url = results.value.photoURL[currentImageIndex.value]
    return `${baseUrl}${url}`;
  }
  return '';
});

// 绑定当前图片提示文字
const currentImageText = computed(() => results.value.messageList[currentImageIndex.value]);

// 切换到上一张图片
const prevImage = () => {
    if (currentImageIndex.value > 0) {
        currentImageIndex.value--;
    }
}

// 切换到下一张图片
const nextImage = () => {
    if (currentImageIndex.value < results.value.photoURL.length - 1) {
        currentImageIndex.value++;
    }
}

// 在图片框中鼠标的位置
const mouseX = ref(null);
const mouseY = ref(null);
const GetMousePos = (e) => {
    mouseX.value = e.offsetX;
    mouseY.value = e.offsetY;
}
// 更换了想要检测的图片
const onCancel = () => {
    console.log("you have canceled the upload");
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

// 图片上传组件container
.upload-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex:1; //默认占屏幕的1/3
}
// 动画
.left-slide-enter-active, .left-slide-leave-active {
    transition: all 10s ease;
}

// 装有全部返回结果的container
.default {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.move-right {
    transform: translateX(40vx);
}

.divider {
    margin: 9px;
}

// 详细结果：分两行
// 展示结果的盒子
.result-list-container {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    width: 90%;
    // margin: 0 auto; /* 居中对齐并给予边距 */
    flex: 2; //默认占2/3
}

.detail-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

// 第一行是图片
.photo-display-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 10px;
    box-sizing: border-box;

    img {
        width: 80%;
        height: auto;
    }
}

// 第二行是各种提示
.tip-info-container {
    display: flex;
    justify-content: space-between; /* 子元素两边对齐，平分剩余空间 */
    align-items: center; /* 垂直居中对齐子元素 */
    width: 100%; /* 父容器占满宽度 */

    .img-result-container, .mouse-pos-container, .button-container {
    display: flex;
    justify-content: center; /* 子元素内容水平居中对齐 */
    align-items: center; /* 子元素内容垂直居中对齐 */
}
}


// .button {
//     display: flex;
//     flex-direction: row;
//     padding: 5px 10px;
// }


// .photo-display-img {
//     width: 150px; /* 调整图片宽度 */
//     height: auto;
//     margin-right: 10px; /* 图片右边距 */
// }

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
