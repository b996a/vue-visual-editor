import deepcopy from "deepcopy";
import { ElFormItem, ElInput,ElButton} from "element-plus";
import { defineComponent,ref } from "vue";


export default defineComponent({
  props:{
    lastSelectBlock:{type:Object}
  },
  setup(props){
    const events = ref(deepcopy(props.lastSelectBlock.events))
    //事件修改确认
    const applyEvents = ()=>{
      props.lastSelectBlock.events = events.value
    }
    //事件重置
    const resetEvents = ()=>{
      events.value = events.value.map((event)=>{
        event.param = '';
        return event
      })
      console.log(events.value)
      props.lastSelectBlock.events = events.value
    }
    return ()=>{
      return (
        <div style="padding-top:20px">
          {
            (events.value.map((event)=>{
              return (
                <ElFormItem label={event.label}>
                  <ElInput v-model={event.param} ></ElInput>
                </ElFormItem>
              )
            }))
          }
          <ElFormItem>
            <ElButton type="primary" onclick={() => applyEvents()}>
              应用
            </ElButton>
            <ElButton  onclick={() => resetEvents()}>
              重置
            </ElButton>
          </ElFormItem>
        </div>
      )
    }
  }
})