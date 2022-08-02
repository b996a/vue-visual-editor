import { ElDialog, ElInput, ElButton } from 'element-plus'
import { createVNode, defineComponent, reactive, render } from 'vue'

const DiglogComponent = defineComponent({
  props: {
    option: {
      type: Object
    }
  },
  setup(props, ctx) {
    const state = reactive({
      option: props.option, // 用户给组件的属性
      isShow: false
    })
    ctx.expose({
      showDialog(option) {
        state.option = option
        state.isShow = true
      }
    })
    const onCancel = () => {
      state.isShow = false
    }
    const onConfirm = () => {
      state.isShow = false
      state.option.onConfirm && state.option.onConfirm(state.option.content)
    }
    // 返回element-plus中的ElDialog组件
    return () => {
      return (
        <ElDialog v-model={state.isShow} title={state.option.title}>
          {{
            default: () => <ElInput type="textarea" v-model={state.option.content} rows={10}></ElInput>,
            footer: () =>
              state.option.footer && (
                <div>
                  <ElButton type="default" onclick={onCancel}>
                    取消
                  </ElButton>
                  <ElButton type="primary" onclick={onConfirm}>
                    确定
                  </ElButton>
                </div>
              )
          }}
        </ElDialog>
      )
    }
  }
})
let vm
export function $dialog(option) {
  if (!vm) {
    // 手动挂载组件
    let el = document.createElement('div')
    // 将组件渲染成虚拟节点，同时把option传给组件
    vm = createVNode(DiglogComponent, { option })
    // 调用render函数将虚拟节点渲染成真实节点，将el挂载到body中
    document.body.appendChild((render(vm, el), el))
  }
  //  从虚拟节点中解构出暴露的showDialog方法
  let { showDialog } = vm.component.exposed
  showDialog(option)
}
