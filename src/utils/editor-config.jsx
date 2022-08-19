// 列表区可以显示所有的元素
import { ElButton, ElInput, ElOption, ElSelect } from 'element-plus'
import Range from '@/components/Range.jsx'
import 'animate.css'
// key对应的元素的映射关系
function createEditorConfig() {
  // 元素表
  const componentList = []
  // 映射关系表
  const componentMap = {}
  return {
    componentList,
    componentMap,
    register: component => {
      componentList.push(component)
      componentMap[component.key] = component
    }
  }
}
export let registerConfig = createEditorConfig()
const createInputProp = label => ({ type: 'input', label })
const createColorProp = label => ({ type: 'color', label })
const createSelectProp = (label, options) => ({ type: 'select', label, options })
const createTableProp = (label, table) => ({ type: 'table', label, table })

// console.log(registerConfig)
registerConfig.register({
  label: '文本',
  preview: () => <span>预览文本</span>,
  render: ({ props }) => <span style={{ color: props.color, fontSize: props.fontSize }}>{props.text || '默认文本'}</span>,
  key: 'text',
  animate:{},
  props: {
    text: createInputProp('文本内容'),
    color: createColorProp('字体颜色'),
    fontSize: createSelectProp('字体大小', [
      { label: '14px', value: '14px' },
      { label: '18px', value: '18px' },
      { label: '22px', value: '22px' }
    ])
  }
})
registerConfig.register({
  label: '按钮',
  resize: {
    width: true,
    height: true
  },
  preview: () => <ElButton>预览按钮</ElButton>,
  render: ({ size, props }) => (
    <ElButton style={{ width: size.width + 'px', height: size.height + 'px' }} type={props.type} size={props.size}>
      {props.text || '默认按钮'}
    </ElButton>
  ),
  key: 'button',
  animate:{},
  props: {
    text: createInputProp('文本内容'),
    type: createSelectProp('按钮类型', [
      { label: '默认按钮', value: 'primary' },
      { label: '成功按钮', value: 'success' },
      { label: '危险按钮', value: 'danger' },
      { label: '警告按钮', value: 'warning' },
      { label: '文本按钮', value: 'text' }
    ]),
    size: createSelectProp('按钮尺寸', [
      { label: '小型按钮', value: 'small' },
      { label: '默认按钮', value: 'default' },
      { label: '大型按钮', value: 'large' }
    ])
  }
})
registerConfig.register({
  label: '输入框',
  resize: {
    width: true //true 代表可以改变输入框的横向大小
  },
  preview: () => <ElInput placeholder="预览"></ElInput>,
  render: ({ size, props, model }) => <ElInput style={{ width: size.width + 'px' }} placeholder={props.placeholder} type={props.type} {...model.default}></ElInput>,
  key: 'input',
  animate:{},
  model: {
    default: '绑定字段'
  },
  props: {
    placeholder: createInputProp('输入框占位文本'),
    type: createSelectProp('按钮类型', [
      { label: '默认输入框', value: 'text' },
      { label: '文本域', value: 'textarea' },
      { label: '时间选择器', value: 'date' },
      { label: '选择文件', value: 'file' }
    ])
  }
})
registerConfig.register({
  label: '下拉框',
  preview: () => <ElSelect modelValue="" placeholder="预览"></ElSelect>,
  render: ({ props, model }) => {
    return (
      <ElSelect {...model.default}>
        {(props.options || []).map((item, index) => {
          return <ElOption label={item.label} value={item.value} key={index}></ElOption>
        })}
      </ElSelect>
    )
  },
  key: 'select',
  animate:{},
  model: {
    default: '绑定字段'
  },
  props: {
    options: createTableProp('下拉选项', {
      options: [
        { label: '显示值', field: 'label' },
        { label: '绑定值', field: 'value' }
      ],
      key: 'label'
    })
  }
})
registerConfig.register({
  label: '范围选择器',
  preview: () => <Range></Range>,
  render: ({ props, model }) => (
    <Range
      {...{
        start: model.start.modelValue,
        end: model.end.modelValue,
        'onUpdata:start': model.start['onUpdata;modelValue'],
        'onUpdata:end': model.end['onUpdata;modelValue']
      }}
    ></Range>
  ),
  key: 'range',
  model: {
    start: '开始范围字段',
    end: '结束范围字段'
  },
  props: {},
  animate:{}
})
