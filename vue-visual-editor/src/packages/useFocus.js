import { computed, ref } from 'vue'
export function useFocus(data, containerRef, selectedBoxRef, canvasRef, previewRef, callback) {
  // 设置点击索引
  const selectIndex = ref(-1)
  // 当前最后一个点击的元素
  const lastSelectBlock = computed(() => data.value.blocks[selectIndex.value])
  // 计算是否选中
  const focusData = computed(() => {
    let focus = []
    let unfocused = []
    data.value.blocks.forEach(block => (block.focus ? focus : unfocused).push(block))
    return { focus, unfocused }
  })

  const blockMousedown = (e, block, index) => {
    if (previewRef.value) return
    // console.log(focusData)
    e.preventDefault() //阻止默认行为
    e.stopPropagation() //阻止冒泡
    // 设置一个属性focus,获取焦点后就将focus变为true
    if (e.shiftKey) {
      if (focusData.value.focus.length <= 1) {
        block.focus = true
      } else {
        block.focus = !block.focus
      }
      // 按住shift
    } else if (block.focus && state.flag) {
      block.focus = true
      state.flag = false
    } else {
      if (!block.focus) {
        clearBlockFocus()
        block.focus = true
      }
    }
    selectIndex.value = index
    callback(e)
  }

  // 清除样式
  const clearBlockFocus = () => {
    state.flag = false
    data.value.blocks.forEach(block => {
      block.focus = false
    })
  }
  const state = {
    startPoint: '',
    endPoint: '',
    flag: false
  }
  // 判断拖拽框是否与元素重合
  const twoRectsHaveIntersection = (rect1, rect2) => {
    const left1 = rect1.left
    const left2 = rect2.left
    const right1 = rect1.left + rect1.width
    const right2 = rect2.left + rect2.width

    const top1 = rect1.top
    const top2 = rect2.top
    const bottom1 = rect1.top + rect1.height
    const bottom2 = rect2.top + rect2.height

    const width1 = rect1.width
    const width2 = rect2.width
    const height1 = rect1.height
    const height2 = rect2.height
    // 边界判断，判断框是否与元素重合
    const noIntersection = left2 > right1 || left1 > right2 || bottom1 < top2 || bottom2 < top1 || width1 <= 0 || width2 <= 0 || height1 <= 0 || height2 <= 0

    return !noIntersection
  }
  // 选择在拖拽框中的元素
  const selectblocks = () => {
    const areaRect = selectedBoxRef.value.getBoundingClientRect()
    const blocks = containerRef.value.querySelectorAll('.editor-block') //获取所有.editor-block类名的元素
    // console.log(blocks)
    // 遍历blocks，判断该元素是否在拖拽框中
    for (const block of blocks) {
      // console.log(block)
      const blockRect = block.getBoundingClientRect()
      const hasIntersection = twoRectsHaveIntersection(areaRect, blockRect)
      // 拿到block的自定义属性name
      const blockName = block.getAttribute('data-name')
      // console.log(blockName)
      // 遍历元素数组如果该元素的name等于遍历的name，就证明该元素在拖拽框内
      data.value.blocks.forEach(block => {
        if (block.name === blockName) {
          if (hasIntersection) {
            block.focus = true
          } else {
            block.focus = false
          }
        }
      })
    }
  }
  // 计算拖拽框的值
  const getRelativePositionInElement = (clientX, clientY) => {
    const rect = containerRef.value.getBoundingClientRect() //获取DOM元素到浏览器可视范围的距离（不包含文档卷起的部分
    // console.log(rect)
    const { left, top } = rect
    // scrollLeft 、scrollTop 设置或获取位于对象最顶/左端和窗口中可见内容的最顶/左端之间的距离。即当前上滚或左滚的距离
    // scrollWidth, scrollHeight 获取对象可滚动的总高度/宽度
    const { scrollLeft, scrollTop, scrollWidth, scrollHeight } = containerRef.value
    // x=鼠标位置减去元素到左侧的位置加上卷曲的距离
    let x = clientX - left + scrollLeft
    let y = clientY - top + scrollTop
    // 如果鼠标点在border上, 强制设为0
    if (x < 0) {
      x = 0
      // 如果鼠标在右侧的border上，则设置为可滚动的总宽度，即最右边
    } else if (x > scrollWidth) {
      x = scrollWidth
    }
    // 同理
    if (y < 0) {
      y = 0
    } else if (y > scrollHeight) {
      y = scrollHeight
    }

    return { x: Math.round(x), y: Math.round(y) } //对x和y进行四舍五入
  }

  const updateArea = () => {
    // 获取拖拽框的定位和宽高，并设置
    const top = Math.min(state.startPoint.y, state.endPoint.y)
    const left = Math.min(state.startPoint.x, state.endPoint.x)
    const width = Math.abs(state.startPoint.x - state.endPoint.x)
    const height = Math.abs(state.startPoint.y - state.endPoint.y)
    selectedBoxRef.value.style.top = top + 'px'
    selectedBoxRef.value.style.left = left + 'px'
    selectedBoxRef.value.style.width = width + 'px'
    selectedBoxRef.value.style.height = height + 'px'
    selectblocks()
  }

  // 点击外面盒子，清空选中状态
  const containerMousedown = e => {
    if (previewRef.value) return
    e.preventDefault() //阻止默认行为
    e.stopPropagation() //阻止冒泡
    clearBlockFocus()
    selectIndex.value = -1
    state.flag = true
    // console.log(e)
    const { clientX, clientY } = e
    state.startPoint = getRelativePositionInElement(clientX, clientY)
    // console.log(state.startPoint)
    state.endPoint = state.startPoint
    updateArea()
    showArea()
    document.addEventListener('mousemove', containerMousemove)
    document.addEventListener('mouseup', containerMouseup)
  }

  const containerMousemove = e => {
    const { clientX, clientY } = e
    state.endPoint = getRelativePositionInElement(clientX, clientY)
    // console.log(state.endPoint)
    updateArea()
    scrollOnDrag(clientX, clientY)
  }

  const containerMouseup = e => {
    // 清除鼠标移动事件
    document.removeEventListener('mousemove', containerMousemove)
    // 隐藏盒子
    hideArea()
  }

  const scrollOnDrag = (mouseX, mouseY) => {
    const { x, y, width, height } = canvasRef.value.getBoundingClientRect()
    // console.log(mouseX, mouseY)
    // console.log(x, y, width, height)
    let scrollX, scrollY
    // 如果鼠标距离可视边界，小于x（大盒子的最左边与可视边界的距离，即不在盒子里，就卷曲mousex-x距离
    if (mouseX < x) {
      scrollX = mouseX - x
    } else if (mouseX > x + width) {
      // 大于x+width,则证明鼠标超出盒子外，需要卷曲超出的距离mouseX - (x + width)
      scrollX = mouseX - (x + width)
      // console.log(scrollX)
    }
    // 同理
    if (mouseY < y) {
      scrollY = mouseY - y
    } else if (mouseY > y + height) {
      scrollY = mouseY - (y + height)
    }

    if (scrollX || scrollY) {
      canvasRef.value.scrollBy({
        left: scrollX,
        top: scrollY
        // behavior: 'auto'
      })
    }
  }

  const hideArea = () => {
    if (selectedBoxRef.value) {
      selectedBoxRef.value.style.display = 'none'
    }
  }

  const showArea = () => {
    if (selectedBoxRef.value) {
      selectedBoxRef.value.style.display = 'block'
    }
  }

  return {
    blockMousedown,
    containerMousedown,
    focusData,
    lastSelectBlock,
    clearBlockFocus
  }
}
