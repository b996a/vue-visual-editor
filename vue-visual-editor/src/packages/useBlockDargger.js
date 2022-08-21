import { reactive } from 'vue'
import { events } from './events'
export function useBlockDargger(focusData, lastSelectBlock, data) {
  let dragState = {
    startX: 0,
    startY: 0,
    dragging: false
  }
  let markLine = reactive({
    x: null,
    y: null
  })
  const mousedown = e => {
    // 拿到最后一个元素的宽高
    const { width: BWidth, height: BHeight } = lastSelectBlock.value
    // console.log(dragState.startPos)
    // console.log(focusData.value.focus[0].focus)
    // 如果没有选中的元素，则不绑定事件
    if (focusData.value.focus.length > 0) {
      dragState = {
        dragging: false,
        startX: e.clientX,
        startY: e.clientY,
        startLeft: lastSelectBlock.value.left, //拖拽前的位置
        startTop: lastSelectBlock.value.top,
        startPos: focusData.value.focus.map(({ top, left }) => ({ top, left })),
        lines: (() => {
          // 拿到没选中的元素
          let { unfocused } = focusData.value
          let lines = { x: [], y: [] }
          unfocused = [
            ...unfocused,
            reactive({
              left: 0,
              top: 0,
              width: data.value.container.width,
              height: data.value.container.height
            })
          ].forEach(block => {
            // 解构出并重名名
            const { left: ALeft, top: ATop, width: AWidth, height: AHeight } = block
            // 第一种情况，当A元素和B元素top相等时，此时showTop: ATop的位置显示这根辅助线，触发辅助线的位置就是top：ATop
            lines.y.push({ showTop: ATop, top: ATop })
            // 顶对底
            lines.y.push({ showTop: ATop, top: ATop - BHeight })
            // 中对中
            lines.y.push({ showTop: ATop + (AHeight >> 1), top: ATop + (AHeight >> 1) - (BHeight >> 1) })
            // 底对顶
            lines.y.push({ showTop: ATop + AHeight, top: ATop + AHeight })
            // 底对底
            lines.y.push({ showTop: ATop + AHeight, top: ATop + AHeight - BHeight })
            // 左对左
            lines.x.push({ showLeft: ALeft, Left: ALeft })
            // 右对左
            lines.x.push({ showLeft: ALeft + AWidth, Left: ALeft + AWidth })
            // 中对中
            lines.x.push({ showLeft: ALeft + (AWidth >> 1), Left: ALeft + (AWidth >> 1) - (BWidth >> 1) })
            // 左对右
            lines.x.push({ showLeft: ALeft, Left: ALeft - BWidth })
            // 右对右
            lines.x.push({ showLeft: ALeft + AWidth, Left: ALeft + AWidth - BWidth })
          })
          return lines
        })()
      }
      document.addEventListener('mousemove', mousemove)
      document.addEventListener('mouseup', mouseup)
    }
  }
  const mousemove = e => {
    if (!dragState.dragging) {
      dragState.dragging = true
      events.emit('start') //发布start事件
    }
    let { clientX: moveX, clientY: moveY } = e //拿到移动中的宽度和高度
    // 计算当前元素的最新的left和top，去辅助线数组里找，如果找到就显示辅助线
    // 元素移动的距离等于鼠标移动后减去鼠标移动前加上元素刚开始的left位置
    let left = moveX - dragState.startX + dragState.startLeft
    // console.log(left)
    let top = moveY - dragState.startY + dragState.startTop
    let x = null
    let y = null
    for (let i = 0; i < dragState.lines.y.length; i++) {
      const { showTop: s, top: t } = dragState.lines.y[i] //获取每一根线
      //如果小于5，说明接近元素
      if (Math.abs(top - t) < 5) {
        y = s //拿到触发top
        moveY = dragState.startY - dragState.startTop + t
        break //找到一根线就跳出循环
      }
    }
    for (let i = 0; i < dragState.lines.x.length; i++) {
      const { showLeft: s, Left: l } = dragState.lines.x[i] //获取每一根线
      //如果小于5，说明接近元素
      if (Math.abs(left - l) < 5) {
        x = s //拿到触发top
        moveX = dragState.startX - dragState.startLeft + l
        break //找到一根线就跳出循环
      }
    }
    markLine.x = x
    markLine.y = y
    // console.log(markLine.x, markLine.y)
    let durX = moveX - dragState.startX //用移动中的值，减去初始值得到需要移动的距离
    let durY = moveY - dragState.startY
    // console.log(durX, durY)
    // 循环已选中数组focus，对left和top进行赋值，原来的值加上新移动的值
    focusData.value.focus.forEach((block, idx) => {
      block.left = dragState.startPos[idx].left + durX
      block.top = dragState.startPos[idx].top + durY
    })
  }
  const mouseup = () => {
    document.removeEventListener('mousemove', mousemove)
    document.removeEventListener('mouseup', mouseup)
    // 鼠标离开清除辅助线
    markLine.x = null
    markLine.y = null
    //如果按下时触发了start，抬起后触发end
    if (dragState.dragging) {
      events.emit('end') //发布end事件
    }
  }
  return {
    mousedown,
    markLine
  }
}
