import deepcopy from "deepcopy";
import { ElFormItem, ElInput,ElButton, ElSelect, ElOption } from "element-plus";
import { defineComponent,ref } from "vue";


export default defineComponent({
  props:{
    lastSelectBlock:{type:Object}
  },
  setup(props){
    const animate = ref(deepcopy(props.lastSelectBlock.animate))
    const apply = ()=>{
      props.lastSelectBlock.animate = animate.value
    }
    return ()=>{
      return (
        <div>
          <ElFormItem label="动画名称">
            <ElInput v-model={animate.value.name} disabled ></ElInput>
          </ElFormItem>
          <ElFormItem label="动画持续时间">
            <ElSelect v-model={animate.value.duration} placeholder="单位为秒">
              <ElOption label="default" value=""></ElOption>
              <ElOption label="slow" value="animate__slow"></ElOption>
              <ElOption label="slower" value="animate__slower"></ElOption>
              <ElOption label="fast" value="animate__fast"></ElOption>
              <ElOption label="faster" value="animate__faster"></ElOption>
            </ElSelect>
          </ElFormItem><ElFormItem label="动画延迟">
            <ElSelect v-model={animate.value.delay} placeholder="单位为秒">
              <ElOption label="无延迟" value={0}></ElOption>
              <ElOption label="1s" value={1}></ElOption>
              <ElOption label="2s" value={2}></ElOption>
              <ElOption label="3s" value={3}></ElOption>
              <ElOption label="4s" value={4}></ElOption>
              <ElOption label="5s" value={5}></ElOption>
            </ElSelect>
          </ElFormItem>
          <ElFormItem>
            <ElButton type="primary" onclick={() => apply()}>
              应用
            </ElButton>
          </ElFormItem>
        </div>
      )
    }
  }
})