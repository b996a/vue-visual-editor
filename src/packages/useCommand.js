import deepcopy from 'deepcopy'
import { events } from './events'
import { onUnmounted } from 'vue'
export function useCommand(data, focusData) {
  // 定义整体状态
  const state = {
    current: -1,
    queue: [], //命令队列,存放所有操作过的命令
    commands: {}, //制作命令和执行功能的一个映射表
    commandArray: [], //存放所有命令
    destroyArray: [] // 存放销毁命令的列表
  }

  const registry = command => {
    // 存放注册的命令
    state.commandArray.push(command)
    // 命令名字对应为执行函数
    state.commands[command.name] = (...args) => {
      const { redo, undo } = command.execute(...args)
      redo() //让data.value的数据更新
      //判断是否需要放到命令队列中
      if (!command.pushQueue) {
        return
      }
      let { queue, current } = state
      if (queue.length > 0) {
        queue = queue.slice(0, current + 1) //在放置过程中可能有撤回操作，需要截取current+1的数据，作为新的queue
        state.queue = queue
      }
      queue.push({ redo, undo }) //保存指令的前进后退
      state.current++ //执行命令后current+1
    }
  }
  // 注册命令
  // 前进命令
  registry({
    name: 'redo',
    keyboard: 'ctrl+y',
    execute() {
      return {
        redo() {
          let item = state.queue[state.current + 1] //找到当前的下一步
          item && item.redo && item.redo()
          state.queue.length > state.current + 1 ? state.current++ : state.current //判断是否超出queue长度
        }
      }
    }
  })
  // 后退命令
  registry({
    name: 'undo',
    keyboard: 'ctrl+z',
    execute() {
      return {
        redo() {
          if (state.current === -1) return
          let item = state.queue[state.current]
          item && item.undo && item.undo()
          state.current--
        }
      }
    }
  })
  // 拖拽组件命令
  registry({
    name: 'drag',
    pushQueue: true, // 是否可以加入命令队列
    init() {
      //初始化操作，默认执行
      // 定义start和end接收事件总线发送来的事件，并监听
      this.before = null
      // 拖拽之前的事件,保存状态
      const start = () => {
        this.before = deepcopy(data.value.blocks) //保存初始blocks
        // console.log(this.before)
      }
      // 拖拽之后的事件，触发对应的指令
      const end = () => {
        state.commands.drag()
      }
      // 监听事件
      events.on('start', start)
      events.on('end', end)
      return () => {
        //关闭监听start事件和end事件
        events.off('start', start)
        events.off('end', end)
      }
    },
    execute() {
      let before = this.before // 拿到初始状态
      let after = data.value.blocks // 拖拽后的状态
      return {
        redo() {
          data.value = { ...data.value, blocks: after } //存储当前的状态
        },
        undo() {
          data.value = { ...data.value, blocks: before } // 存储之前的状态
        }
      }
    }
  })
  // 导入数据视图更新命令(更新全部组件或容器大小)
  registry({
    name: 'updataContainer',
    pushQueue: true, // 是否可以加入命令队列
    execute(newValue) {
      let before = data.value // 拿到初始状态
      let after = newValue
      return {
        redo() {
          data.value = after //存储当前的状态
        },
        undo() {
          data.value = before // 存储之前的状态
        }
      }
    }
  })
  // 更新个别组件
  registry({
    name: 'updataBlock',
    pushQueue: true, // 是否可以加入命令队列
    execute(newBlock, oldBlock) {
      let before = data.value.blocks // 拿到初始状态
      let after = (() => {
        let blocks = [...data.value.blocks]
        const index = data.value.blocks.indexOf(oldBlock)
        if (index !== -1) {
          blocks.splice(index, 1, newBlock)
        }
        return blocks
      })()
      return {
        redo() {
          data.value = { ...data.value, blocks: after } //存储当前的状态
        },
        undo() {
          data.value = { ...data.value, blocks: before } // 存储之前的状态
        }
      }
    }
  })
  // 置顶命令
  registry({
    name: 'placeTop',
    pushQueue: true, // 是否可以加入命令队列
    execute() {
      let before = deepcopy(data.value.blocks) // 拿到初始状态
      let after = (() => {
        let { focus, unfocused } = focusData.value
        let maxZIndex = 0
        unfocused.forEach(block => {
          maxZIndex = Math.max(maxZIndex, block.zIndex)
        })
        focus.forEach(block => {
          block.zIndex = maxZIndex + 1
        })
        return data.value.blocks
      })() // 拖拽后的状态
      return {
        redo() {
          data.value = { ...data.value, blocks: after } //存储当前的状态
        },
        undo() {
          data.value = { ...data.value, blocks: before } // 存储之前的状态
        }
      }
    }
  })
  // 置底命令
  registry({
    name: 'placeBottom',
    pushQueue: true, // 是否可以加入命令队列
    execute() {
      let before = deepcopy(data.value.blocks) // 拿到初始状态
      let after = (() => {
        let { focus, unfocused } = focusData.value
        let minZIndex = Infinity
        unfocused.forEach(block => {
          minZIndex = Math.min(minZIndex, block.zIndex)
        })
        minZIndex -= 1
        // 不能直接减一，index不能出现负值
        //特殊情况，zIndez出现负值，则让未选中的组件向上
        if (minZIndex < 0) {
          const dur = Math.abs(minZIndex)
          minZIndex = 0
          unfocused.forEach(block => {
            block.zIndex += dur
          })
        }
        focus.forEach(block => {
          block.zIndex = minZIndex
        })
        return data.value.blocks
      })() // 拖拽后的状态
      return {
        redo() {
          data.value = { ...data.value, blocks: after } //存储当前的状态
        },
        undo() {
          data.value = { ...data.value, blocks: before } // 存储之前的状态
        }
      }
    }
  })
  // 删除命令
  registry({
    name: 'delete',
    pushQueue: true, // 是否可以加入命令队列
    execute() {
      let before = deepcopy(data.value.blocks) // 拿到初始状态
      let after = focusData.value.unfocused // 选中的都删除了
      return {
        redo() {
          data.value = { ...data.value, blocks: after } //存储当前的状态
        },
        undo() {
          data.value = { ...data.value, blocks: before } // 存储之前的状态
        }
      }
    }
  })
  // 保存命令
  registry({
    name: 'store',
    keyboard: 'ctrl+s',
    execute() {
      return {
        redo() {
          data.value.isStore = true //已保存
          localStorage.setItem('data', JSON.stringify(data.value)) //保存到localStorage
          // console.log('保存成功')
        }
      }
    }
  })
  // 键盘监听函数(自执行)
  const keyboardEvent = (() => {
    const keyCodes = {
      89: 'y',
      90: 'z',
      83: 's'
    }
    const onKeydown = e => {
      const { ctrlKey, keyCode } = e
      let keyString = []
      if (ctrlKey) keyString.push('ctrl')
      keyString.push(keyCodes[keyCode])
      keyString = keyString.join('+')
      // console.log(keyString)
      state.commandArray.forEach(({ keyboard, name }) => {
        if (!keyboard) return // 如果没有keyboard，就是没有键盘事件
        if (keyboard === keyString) {
          state.commands[name]() //执行函数
          e.preventDefault() //阻止默认行为
        }
      })
    }
    // 初始化
    const init = () => {
      window.addEventListener('keydown', onKeydown)
      return () => {
        window.removeEventListener('keydown', onKeydown)
      }
    }
    return init
  })()
  // 遍历执行所有init()
  ;(() => {
    state.destroyArray.push(keyboardEvent())
    state.commandArray.forEach(command => command.init && state.destroyArray.push(command.init()))
    // console.log(state.destroyArray)
  })()
  // 在执行销毁函数时，关闭所有监听事件
  onUnmounted(() => {
    state.destroyArray.forEach(fn => fn && fn())
  })
  return state
}
