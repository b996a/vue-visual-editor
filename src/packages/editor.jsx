import { computed, defineComponent, inject, ref } from 'vue'
import '@/assets/css/editor.scss'
import EditorBlock from './editor-block'
import deepcopy from 'deepcopy'
import { useMenuDragger } from './useMenuDragger'
import { useFocus } from './useFocus'
import { useBlockDargger } from './useBlockDargger'
import { useCommand } from './useCommand.js'
import { ElButton } from 'element-plus'
import { useButtons } from './useButtons'
import { onContextMenuBlock } from './useContextMenuBlock'
import EditorOperator from '@/packages/editor-operator'
export default defineComponent({
  props: {
    modelValue: {
      type: Object
    }
  },
  emits: ['update:modelValue'],
  setup(props, ctx) {
    // 对数据进行处理
    const data = computed({
      get() {
        return props.modelValue
      },
      set(newValue) {
        ctx.emit('update:modelValue', deepcopy(newValue))
      }
    })
    // console.log(data.value)
    const containerStyles = computed(() => ({
      width: data.value.container.width + 'px',
      height: data.value.container.height + 'px'
    }))
    // 接收config配置
    const config = inject('config')
    const formDate = inject('formDate')
    const containerRef = ref(null)
    const selectedBoxRef = ref(null)
    const canvasRef = ref(null)
    // 预览的状态控制，内容不能在操作，可以点击，输入内容，可以看效果
    const previewRef = ref(false)
    const editorRef = ref(true)
    // console.log(containerRef)
    //1.实现菜单的拖拽功能
    const { dragstart, dragend } = useMenuDragger(data, containerRef)
    // 2.实现获取焦点的功能,或直接拖拽
    const { blockMousedown, containerMousedown, focusData, lastSelectBlock, clearBlockFocus } = useFocus(data, containerRef, selectedBoxRef, canvasRef, previewRef, e => {
      mousedown(e)
    })
    // 3.实现拖拽多个元素的功能
    const { mousedown, markLine } = useBlockDargger(focusData, lastSelectBlock, data)
    // 命令库
    const { commands } = useCommand(data, focusData)
    // 按钮库
    const buttons = useButtons(data, commands, previewRef, editorRef, clearBlockFocus)
    return () =>
      !editorRef.value ? (
        <>
          <div class="editor-container-canvas__content" style={containerStyles.value}>
            {/* 渲染对应的元素 */}
            {data.value.blocks.map((block, index) => (
              <EditorBlock class={'editor-block-preview'} block={block} formData={formDate}></EditorBlock>
            ))}
          </div>
          <span>
            <ElButton type="primary" onClick={() => (editorRef.value = true)}>
              继续编辑
            </ElButton>
          </span>
        </>
      ) : (
        <div class="editor">
          <div class="editor-left">
            <div class="editor-left-title">元素区</div>
            {/* 根据注册列表渲染对应预览元素 */}
            {config.componentList.map(component => (
              // dragstart: 用户开始拖拉元素的时候触发
              // drag:元素拖动过程中触发
              // dragend: 用户完成元素拖动后触发
              <div class="editor-left-item" draggable ondragstart={e => dragstart(e, component)} ondragend={dragend}>
                <span>{component.label} </span>
                <div>{component.preview()} </div>
              </div>
            ))}
          </div>

          <div class="editor-top">
            {buttons.map((button, index) => {
              const icon = typeof button.icon === 'function' ? button.icon() : button.icon
              const label = typeof button.label === 'function' ? button.label() : button.label
              return (
                <div class="editor-top-button" onClick={button.handler}>
                  <i class={icon}></i>
                  <span>{label}</span>
                </div>
              )
            })}
          </div>
          <div class="editor-right">
            <div class="editor-right-title">元素配置</div>
            <EditorOperator commands={commands} block={lastSelectBlock.value} data={data.value}></EditorOperator>
          </div>
          <div class="editor-container">
            {/* {负责产生滚动条} */}
            <div class="editor-container-canvas" ref={canvasRef}>
              {/* 产生内容区域 ref绑定目标容器containerRef*/}
              <div
                class="editor-container-canvas__content"
                style={containerStyles.value}
                ref={containerRef}
                onMousedown={e => {
                  containerMousedown(e)
                }}
              >
                {/* 渲染对应的元素 */}
                {data.value.blocks.map((block, index) => (
                  <EditorBlock
                    class={block.focus ? 'editor-block-focus' : previewRef.value ? 'editor-block-preview' : ''}
                    block={block}
                    formData={formDate}
                    onMousedown={e => {
                      blockMousedown(e, block, index)
                    }}
                    onContextmenu={e => onContextMenuBlock(e, block, commands)}
                  ></EditorBlock>
                ))}
                {markLine.x !== null && <div class="line-x" style={{ left: markLine.x + 'px' }}></div>}
                {markLine.y !== null && <div class="line-y" style={{ top: markLine.y + 'px' }}></div>}
                <div class="selected-box" ref={selectedBoxRef}></div>
              </div>
            </div>
          </div>
        </div>
      )
  }
})
