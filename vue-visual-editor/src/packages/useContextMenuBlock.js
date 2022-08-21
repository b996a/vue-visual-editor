import { $dropdown, DropdownItem } from '@/components/Dropdown'
import { $dialog } from '@/components/Dialog'
export const onContextMenuBlock = (e, block, commands) => {
  e.preventDefault()
  $dropdown({
    el: e.target, //以目标元素位置生成组件
    block,
    content: () => {
      return (
        <>
          <DropdownItem
            label="删除"
            icon="icon-delete"
            onClick={() => {
              commands.delete()
            }}
          ></DropdownItem>
          <DropdownItem
            label="保存"
            icon="icon-entypomenu"
            onClick={() => {
              commands.store()
            }}
          ></DropdownItem>
          <DropdownItem
            label="置顶"
            icon="icon-place-top"
            onClick={() => {
              commands.placeTop()
            }}
          ></DropdownItem>
          <DropdownItem
            label="置底"
            icon="icon-place-bottom"
            onClick={() => {
              commands.placeBottom()
            }}
          ></DropdownItem>
          <DropdownItem
            label="查看"
            icon="icon-browse"
            onClick={() => {
              $dialog({
                title: '查看节点数据',
                content: JSON.stringify(block)
              })
            }}
          ></DropdownItem>
          <DropdownItem
            label="导入"
            icon="icon-import"
            onClick={() => {
              $dialog({
                title: '导入节点数据',
                content: '',
                footer: true,
                onConfirm: text => {
                  text = JSON.parse(text)
                  commands.updataBlock(text, block)
                }
              })
            }}
          ></DropdownItem>
        </>
      )
    }
  })
}
