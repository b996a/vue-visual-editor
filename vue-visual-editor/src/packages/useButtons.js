import { $dialog } from '@/components/Dialog'

export function useButtons(data, commands, previewRef, editorRef, clearBlockFocus) {
  const buttons = [
    {
      label: '撤销',
      icon: 'icon-back',
      handler: () => {
        commands.undo()
      }
    },
    {
      label: '前进',
      icon: 'icon-forward',
      handler: () => {
        commands.redo()
      }
    },
    {
      label: '导出',
      icon: 'icon-export',
      handler: () => {
        $dialog({
          title: '导出json数据',
          content: JSON.stringify(data.value),
          footer: false
        })
      }
    },
    {
      label: '导入',
      icon: 'icon-import',
      handler: () => {
        $dialog({
          title: '导入json数据',
          content: '',
          footer: true,
          onConfirm: text => {
            commands.updataContainer(JSON.parse(text))
          }
        })
      }
    },
    {
      label: '置顶',
      icon: 'icon-place-top',
      handler: () => {
        commands.placeTop()
      }
    },
    {
      label: '置底',
      icon: 'icon-place-bottom',
      handler: () => {
        commands.placeBottom()
      }
    },
    {
      label: '删除',
      icon: 'icon-delete',
      handler: () => {
        commands.delete()
      }
    },
    {
      label: () => {
        return previewRef.value ? '编辑' : '预览'
      },
      icon: () => {
        return previewRef.value ? 'icon-edit' : 'icon-browse'
      },
      handler: () => {
        previewRef.value = !previewRef.value
        clearBlockFocus()
      }
    },
    {
      label: '保存',
      icon: 'icon-entypomenu',
      handler: () => {
        commands.store()
      }
    },
    {
      label: '关闭',
      icon: 'icon-close',
      handler: () => {
        editorRef.value = false
        clearBlockFocus()
      }
    }
  ]
  return buttons
}
