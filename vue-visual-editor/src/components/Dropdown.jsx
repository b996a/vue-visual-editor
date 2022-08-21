import { computed, ref, createVNode, defineComponent, onMounted, reactive, render, onBeforeUnmount, provide, inject } from 'vue'
export const DropdownItem = defineComponent({
  props: {
    label: String,
    icon: String
  },
  setup(props) {
    let { label, icon } = props
    let hide = inject('hide')
    return () => (
      <div class="dropdown-item" onClick={hide}>
        <i class={icon}></i>
        <span>{label}</span>
      </div>
    )
  }
})

const DefineComponent = defineComponent({
  props: {
    option: {
      type: Object
    }
  },
  setup(props, ctx) {
    const state = reactive({
      option: props.option,
      isShow: false,
      top: 0,
      left: 0
    })
    ctx.expose({
      showDropdown(option) {
        state.option = option
        state.isShow = true
        let { top, left, height, width } = option.el.getBoundingClientRect()
        state.top = top + height
        state.left = left + (width >> 1)
      }
    })
    provide('hide', () => {
      state.isShow = false
    })
    const classes = computed(() => [
      'dropdown',
      {
        'dropdown-isShow': state.isShow
      }
    ])
    const styles = computed(() => ({
      top: state.top + 'px',
      left: state.left + 'px',
      zIndex: 10000 //右键菜单最高可见
    }))
    const el = ref(null)
    const onMousedownDocument = e => {
      if (!el.value.contains(e.target)) {
        state.isShow = false
      }
    }
    onMounted(() => {
      // 事件传递是先捕获，再冒泡
      // 因为之前在获取焦点的时候阻止了冒泡行为,这里用捕获触发事件
      document.body.addEventListener('mousedown', onMousedownDocument, true)
    })
    onBeforeUnmount(() => {
      document.body.removeEventListener('mousedown', onMousedownDocument)
    })
    return () => {
      return (
        <div class={classes.value} style={styles.value} ref={el}>
          {state.option.content()}
        </div>
      )
    }
  }
})

let vm
export function $dropdown(option) {
  if (!vm) {
    let el = document.createElement('div')
    vm = createVNode(DefineComponent, { option })
    document.body.appendChild((render(vm, el), el))
  }
  let { showDropdown } = vm.component.exposed
  showDropdown(option)
}
