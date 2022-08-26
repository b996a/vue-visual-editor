import { events } from './events'
export function useMenuDragger(data, containerRef) {
  let currentComponent = null
  let num = 1
  const dragstart = (e, component) => {
    // dragenter:进入目标区域时触发（一瞬间的触发）添加一个移动的标识
    // dragover:在目标区域中时触发（始终触发状态）阻止默认行为
    // dragleave （不松开鼠标的情况下）离开目标区域时触发（可重复触发）添加一个禁用标识
    // drop 在目标区域中松开鼠标时触发，并放下被拖拽的元素,添加一个元素
    containerRef.value.addEventListener('dragenter', dragenter)
    containerRef.value.addEventListener('dragover', dragover)
    containerRef.value.addEventListener('dragleave', dragleave)
    containerRef.value.addEventListener('drop', drop)
    // 存储当前拖动的元素
    currentComponent = component
    events.emit('start') //发布start事件
  }
  const dragend = () => {
    containerRef.value.removeEventListener('dragenter', dragenter)
    containerRef.value.removeEventListener('dragover', dragover)
    containerRef.value.removeEventListener('dragleave', dragleave)
    containerRef.value.removeEventListener('drop', drop)
    events.emit('end') //发布end事件
  }
  const dragenter = e => {
    e.dataTransfer.dropEffect = 'move'
  }
  const dragover = e => {
    e.preventDefault()
  }
  const dragleave = e => {
    e.dataTransfer.dropEffect = 'none'
  }
  const drop = e => {
    // console.log(currentComponent)
    let blocks = data.value.blocks
    data.value = {
      ...data.value,
      blocks: [
        ...blocks,
        {
          top: e.offsetY,
          left: e.offsetX,
          zIndex: 1,
          key: currentComponent.key,
          name: currentComponent.key + num++,
          alignCenter: true,
          props: {},
          model: {},
          animate:{},
          events:[
            {
                key: 'redirect',
                label: '跳转事件',
                param: '',
            },
            {
                key: 'alert',
                label: 'alert 事件',
                param: '',
            },
          ],
        }
      ]
    }
    currentComponent = null
  }

  return {
    dragstart,
    dragend
  }
}
