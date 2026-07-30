// @ts-nocheck
import { Button } from "@/components/ui/button";
import { Indent, MessageSquare } from "lucide-react";

interface MobileCodeToolbarProps {
  onTab?: () => void;
  onComment?: () => void;
  editorRef?: any;
}

export function MobileCodeToolbar({ onTab, onComment, editorRef }: MobileCodeToolbarProps) {
  const handleTab = () => {
    if (editorRef?.current) {
      const editor = editorRef.current;
      const selection = editor.getSelection();
      const model = editor.getModel();
      
      if (selection && model) {
        editor.executeEdits('mobile-tab', [{
          range: selection,
          text: '    ',
          forceMoveMarkers: true
        }]);
      }
    }
    onTab?.();
  };

  const handleComment = () => {
    if (editorRef?.current) {
      const editor = editorRef.current;
      editor.trigger('keyboard', 'editor.action.commentLine', {});
    }
    onComment?.();
  };

  return (
    <div className='md:hidden flex items-center gap-2 p-2 bg-gradient-to-r from-card/90 to-card/70 border-t border-border/50 backdrop-blur-sm overflow-x-auto scrollbar-hide shadow-lg'>
      <Button
        variant='outline'
        size='sm'
        onClick={handleTab}
        className='flex items-center gap-2 h-11 px-4 shrink-0 bg-card/50 hover:bg-primary/10 hover:border-primary/40 transition-all'
        title='Добавить отступ (Tab)'
      >
        <Indent className='w-4 h-4 text-primary' />
        <span className='text-xs font-medium'>Tab</span>
      </Button>
      
      <Button
        variant='outline'
        size='sm'
        onClick={handleComment}
        className='flex items-center gap-2 h-11 px-4 shrink-0 bg-card/50 hover:bg-primary/10 hover:border-primary/40 transition-all'
        title='Комментировать (Ctrl+/)'
      >
        <MessageSquare className='w-4 h-4 text-primary' />
        <span className='text-xs font-medium'>// Коммент</span>
      </Button>

      <div className='flex-1 flex items-center justify-end'>
        <span className='text-[10px] text-muted-foreground/60 whitespace-nowrap'>
          Мобильные инструменты
        </span>
      </div>
    </div>
  );
}
