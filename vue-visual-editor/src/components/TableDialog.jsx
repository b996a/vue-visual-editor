import deepcopy from 'deepcopy'
import { ElButton, ElDialog, ElInput, ElTable, ElTableColumn } from 'element-plus'
import { createVNode, defineComponent, reactive, render } from 'vue'

const TableComponent = defineComponent({
  props: {
    option: {
      type: Object
    }
  },
  setup(props, ctx) {
    const state = reactive({
      option: props.option,
      isShow: false,
      editDate: [] //编辑的数据
    })
    let methods = {
      showTable(option) {
        state.option = option //缓存配置
        state.isShow = true
        state.editDate = deepcopy(option.data) // 通过拷贝的数据默认展现
      }
    }
    ctx.expose(methods)
    const add = () => {
      state.editDate.push({})
    }
    const rowDelete = row => {
      console.log(row)
    }
    const onCancel = () => {
      state.isShow = false
    }
    const onConfirm = () => {
      state.isShow = false
      state.option.confirm(state.editDate)
    }
    return () => {
      return (
        <ElDialog v-model={state.isShow} title={state.option.config.label}>
          {{
            default: () => (
              <div>
                <div style={{ textAlign: 'end' }}>
                  <ElButton onClick={add}>添加</ElButton>
                  <ElButton>重置</ElButton>
                </div>
                <ElTable data={state.editDate}>
                  <ElTableColumn type="index"></ElTableColumn>
                  {state.option.config.table.options.map((item, index) => {
                    return (
                      <ElTableColumn label={item.label}>
                        {{
                          default: ({ row }) => <ElInput v-model={row[item.field]}></ElInput>
                        }}
                      </ElTableColumn>
                    )
                  })}
                  <ElTableColumn label="操作" width="100px">
                    <ElButton type="danger">删除</ElButton>
                  </ElTableColumn>
                </ElTable>
              </div>
            ),
            footer: () => (
              <>
                <ElButton onClick={onCancel}>取消</ElButton>
                <ElButton type="primary" onClick={onConfirm}>
                  提交
                </ElButton>
              </>
            )
          }}
        </ElDialog>
      )
    }
  }
})

let vm
export function $tableDialog(option) {
  if (!vm) {
    // 手动挂载元素
    let el = document.createElement('div')
    // 将元素渲染成虚拟节点，同时把option传给元素
    vm = createVNode(TableComponent, { option })
    // 调用render函数将虚拟节点渲染成真实节点，将el挂载到body中
    document.body.appendChild((render(vm, el), el))
  }
  //  从虚拟节点中解构出暴露的showTable方法
  let { showTable } = vm.component.exposed
  showTable(option)
}
