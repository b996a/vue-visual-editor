import { computed, defineComponent, inject, onMounted, ref } from 'vue'
import BlockResize from './block-resize'
import 'animate.css'

export default defineComponent({
  props: {
    block: { type: Object },
    formData: { type: Object }
  },
  setup(props) {
    const blockStyles = computed(() => ({
      top: `${props.block.top}px`,
      left: `${props.block.left}px`,
      zIndex: `${props.block.zIndex}`
    }))
    const config = inject('config') //拿到元素
    const blockRef = ref(null)
    // console.log(blockRef)
    onMounted(() => {
      const { offsetWidth, offsetHeight } = blockRef.value
      //说明是第一次拖拽松手的时候，才渲染的，其他的不需要居中
      if (props.block.alignCenter) {
        // 直接修改block中的值
        props.block.left -= offsetWidth >> 1
        props.block.top -= offsetHeight >> 1
        props.block.alignCenter = false //已经渲染过的block以后不再居中设置
      }
      props.block.width = offsetWidth
      props.block.height = offsetHeight
    })
    // console.log(config)
    // console.log(props.block)
    return () => {
      // 用block中提供的key取出对应的元素
      const component = config.componentMap[props.block.key]
      const RenderComponent = component.render({
        // 发生大小改变就将hasResize置为true,改变对应的元素大小
        size: props.block.hasResize ? { width: props.block.width, height: props.block.height } : {},
        props: props.block.props,
        animate: props.block.animate,
        model: Object.keys(component.model || {}).reduce((prev, modelName) => {
          // 拿到default对应的字段 username
          let propName = props.block.model[modelName]
          prev[modelName] = {
            modelValue: props.formData.value[propName], //formData中对应的值 如username ：admin ，modelValue就是admin
            'onUpdate:modelValue': v => (props.formData.value[propName] = v)
          }
          // console.log(prev)
          return prev
        }, {})
      })
      const animate = computed(() => {
        if ('name' in props.block.animate === false) {
          return 'editor-block'
        } else {
          return `editor-block animate__animated ${props.block.animate.name} ${props.block.animate.duration} animate__delay-${props.block.animate.delay}s`
        }
      })
      const { width, height } = component.resize || {}
      return (
        <div class={animate.value} data-name={props.block.name} style={blockStyles.value} ref={blockRef}>
          {RenderComponent}
          {/* 有选中，且配置项中有width和height设置，显示BlockResize元素 */}
          {props.block.focus && (width || height) && <BlockResize block={props.block} component={component}></BlockResize>}
        </div>
      )
    }
  }
})
