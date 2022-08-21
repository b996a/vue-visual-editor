import { defineComponent, ref } from 'vue'
import EditorOperator from '@/packages/editor-operator'
import { ElButton } from 'element-plus'
import '@element-plus/icons-vue'
import EditorAnimate from './editor-animate'
import animates from './animates.json'
export default defineComponent({
  props: {
    rightActiveIndex: { type: Object },
    commands: { type: Object },
    data: { type: Object },
    lastSelectBlock: { type: Object }
  },
  setup(props) {
    //是否显示所有添加动画按钮
    const isShowAddButton = ref(false)
    //是否显示所有可用动画
    const isShowAllAnimate = ref(false)
    // 是否显示所有事件
    const isShowAllEvent = ref(false)
    const isShowAllEvents = ref(false)
    //获取所有动画
    const animateObj = animates.animates.map(animate => {
      const label = animate.split('_')[2]
      const value = animate
      return {
        label: label,
        value: value
      }
    })
    //动画组件移入事件(悬浮时)
    const animateEnter = value => {
      props.lastSelectBlock.animate = {
        name: value, //动画名
        duration: '', //动画持续时间
        delay: 0 //动画延迟
      }
    }
    //动画组件移出时取消之前移入时绑定的事件
    const animateLeave = value => {
      props.lastSelectBlock.animate = {}
    }
    //动画组件点击事件
    const animateClick = value => {
      props.lastSelectBlock.animate = {
        name: value, //动画名
        duration: '', //动画持续时间
        delay: 0 //动画延迟
      }
      isShowAddButton.value = false
      isShowAllAnimate.value = false
      isShowAllEvent.value = false
      isShowAllEvents.value = false
    }
  // 编辑器自定义事件
	const events = {
    redirect(url) {
        if (url) {
            window.location.href = url
        }
    },

    alert(msg) {
        if (msg) {
            // eslint-disable-next-line no-alert
            alert(msg)
        }
    },
}

const mixins = {
    methods: events,
}
//自定义事件
const eventList = [
    {
        key: 'redirect',
        label: '跳转事件',
        event: events.redirect,
        param: '',
    },
    {
        key: 'alert',
        label: 'alert 事件',
        event: events.alert,
        param: '',
    },
]

    return () => {
      if (props.lastSelectBlock && 'name' in props.lastSelectBlock.animate === false) isShowAddButton.value = true
      //属性
      if (props.rightActiveIndex.value == 1) {
        return <EditorOperator commands={props.commands} block={props.lastSelectBlock} data={props.data.value}></EditorOperator>
      }
      //动画
      if (props.rightActiveIndex.value == 2) {
        return (
          <div>
            {
              //显示时=当前组件的animate为空,此时显示可用操作
              isShowAddButton.value && (
                <>
                  <div>
                    <ElButton
                      icon="Plus"
                      type="primary"
                      plain
                      onClick={() => {
                        ;(isShowAllAnimate.value = true), (isShowAddButton.value = false)
                      }}
                    >
                      添加动画
                    </ElButton>
                  </div>
                </>
              )
            }
            {isShowAllAnimate.value && (
              <div class="animate">
                {animateObj.map(animate => {
                  return (
                    <div
                      onMouseenter={() => animateEnter(animate.value)}
                      onMouseleave={() => {
                        animateLeave(animate.value)
                      }}
                      class="animateItem"
                      onClick={() => animateClick(animate.value)}
                    >
                      <p>{animate.label}</p>
                    </div>
                  )
                })}
              </div>
            )}
            {props.lastSelectBlock && 'name' in props.lastSelectBlock.animate === true && (
              <>
                <div>
                  <EditorAnimate lastSelectBlock={props.lastSelectBlock}></EditorAnimate>
                </div>
              </>
            )}
          </div>
        )
      }
      //事件
	  if (props.rightActiveIndex.value == 3) {
	    return (
	      <div>
	        {
	          isShowAddButton.value && (
	            <>
	              <div>
	                <ElButton
	                  icon="Plus"
	                  type="primary"
	                  plain
	                  onClick={() => {
	                    ;(isShowAllAnimate.value = true), (isShowAddButton.value = false)
	                  }}
	                >
	                  添加事件
	                </ElButton>
	              </div>
	            </>
	          )
	        }
	        {isShowAllAnimate.value && (
	          <div >
	            <p>跳转事件</p>
				<input placeholder="请输入完整的url"></input>
				<ElButton 
					type="success" round
					onClick={() => {
					  ;(isShowAllAnimate.value = false), (isShowAddButton.value = false), (isShowAllEvent.value = true)
					}}
				>
				确定
				</ElButton>
				
				<p>alert事件</p>
				<input placeholder="请输入要alert的内容"></input>
				<ElButton 
					type="success" round
					onClick={() => {
					  ;(isShowAllAnimate.value = false), (isShowAddButton.value = false), (isShowAllEvents.value = true)
					}}
				>
				确定
				</ElButton>
	          </div>
	        )}
	        {isShowAllEvent.value && (
	          <div >
				<ElButton type="info" plain>redirect</ElButton>
	          </div>
	        )}
			{isShowAllEvents.value && (
			  <div >
			   <ElButton type="info" plain>alert</ElButton>
			  </div>
			)}
	      </div>
	    )
	  }
    }
  }
})
