import deepcopy from 'deepcopy'
import { ElForm, ElFormItem, ElButton, ElInputNumber, ElInput, ElColorPicker, ElSelect, ElOption } from 'element-plus'
import { defineComponent, inject, reactive, watch } from 'vue'
import TableEditor from './table-editor'

export default defineComponent({
  props: {
    commands: { type: Object },
    block: { type: Object },
    data: { type: Object }
  },
  setup(props, ctx) {
    const config = inject('config')
    const state = reactive({
      editData: {}
    })
    const reset = () => {
      //判断是改变容器，还是改变组件
      if (!props.block) {
        state.editData = deepcopy(props.data.container)
      } else {
        state.editData = deepcopy(props.block)
      }
      // console.log(state.editData)
    }
    const apply = () => {
      //判断是改变容器，还是改变组件
      if (!props.block) {
        // 只修改data中的container
        props.commands.updataContainer({ ...props.data, container: state.editData })
        // console.log(state.editData)
      } else {
        // 传入新值和老值
        props.commands.updataBlock(state.editData, props.block)
        // console.log(state.editData)
      }
    }
    // 监听props.block,出现修改，就调用reset
    watch(() => props.block, reset, { immediate: true })
    // 监听props.data.container,出现修改，就调用reset
    watch(() => props.data.container, reset, { immediate: true })
    return () => {
      // 定义内容数组
      let content = []
      if (!props.block) {
        content.push(
          <>
            <ElFormItem label="页面名字">
              <ElInput v-model={state.editData.name}></ElInput>
            </ElFormItem>
            <ElFormItem label="容器宽度">
              <ElInputNumber v-model={state.editData.width}></ElInputNumber>
            </ElFormItem>
            <ElFormItem label="容器高度">
              <ElInputNumber v-model={state.editData.height}></ElInputNumber>
            </ElFormItem>
            <ElFormItem label="背景颜色">
              <ElColorPicker v-model={state.editData.backgroundColor}></ElColorPicker>
            </ElFormItem>
            <ElFormItem label="背景图片">
              <ElInput placeholder="输入图片url" v-model={state.editData.backgroundImage}></ElInput>
            </ElFormItem>
            <ElFormItem label="背景图片大小">
              <ElSelect v-model={state.editData.backgroundSize}>
                <ElOption label="默认" value="auto"></ElOption>
                <ElOption label="缩放完全覆盖" value="cover"></ElOption>
                <ElOption label="缩放适应大小" value="contain"></ElOption>
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="背景图片平铺样式">
              <ElSelect placeholder="背景图片平铺样式" v-model={state.editData.backgroundRepeat}>
                <ElOption label="默认" value="repeat"></ElOption>
                <ElOption label="水平重复" value="repeat-x"></ElOption>
                <ElOption label="垂直重复" value="repeat-y"></ElOption>
                <ElOption label="不重复" value="no-repeat"></ElOption>
              </ElSelect>
            </ElFormItem>
          </>
        )
      } else {
        // 拿到对应的组件
        let component = config.componentMap[props.block.key]
        if (component && component.props) {
          // console.log(component.props)
          // console.log(Object.entries(component.props))
          // Object.entries(component.props)将对象转化成键值对的数组
          content.push(
            Object.entries(component.props).map(([propName, propConfig]) => {
              // console.log(propName, propConfig)
              return (
                <ElFormItem label={propConfig.label}>
                  {{
                    input: () => <ElInput v-model={state.editData.props[propName]}></ElInput>,
                    color: () => <ElColorPicker v-model={state.editData.props[propName]}></ElColorPicker>,
                    select: () => (
                      <ElSelect v-model={state.editData.props[propName]}>
                        {propConfig.options.map(opt => {
                          return <ElOption label={opt.label} value={opt.value}></ElOption>
                        })}
                      </ElSelect>
                    ),
                    table: () => <TableEditor propConfig={propConfig} v-model={state.editData.props[propName]}></TableEditor>
                  }[propConfig.type]()}{' '}
                  {/* 返回函数执行，循环渲染 */}
                </ElFormItem>
              )
            })
          )
        }
        if (component && component.model) {
          content.push(
            Object.entries(component.model).map(([modelName, label]) => {
              return (
                <ElFormItem label={label}>
                  <ElInput v-model={state.editData.model[modelName]}></ElInput>
                </ElFormItem>
              )
            })
          )
        }
      }
      return (
        <ElForm label-position="top" style="padding:30px">
          {content}
          <ElFormItem>
            <ElButton type="primary" onclick={() => apply()}>
              应用
            </ElButton>
            <ElButton type="default" onclick={reset}>
              重置
            </ElButton>
          </ElFormItem>
        </ElForm>
      )
    }
  }
})
