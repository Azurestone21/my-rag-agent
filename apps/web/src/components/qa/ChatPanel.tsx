import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Bot, Send, Square } from 'lucide-react'
import { toast } from 'sonner'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group'
import { useChatStore } from '@/store/chat'
import { useKnowledgeBaseStore } from '@/store/knowledgeBase'

export default function ChatPanel() {
  const messages = useChatStore((state) => state.messages)
  const loading = useChatStore((state) => state.loading)
  const sendMessage = useChatStore((state) => state.sendMessage)
  const stop = useChatStore((state) => state.stop)
  const selectedKbId = useKnowledgeBaseStore((state) => state.selectedKbId)
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    if (!selectedKbId) {
      toast.error('请先选择知识库')
      return
    }
    void sendMessage(selectedKbId, input.trim()).catch((error: Error) => {
      toast.error(error.message)
    })
    setInput('')
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-full min-h-[520px] flex-col rounded-lg border border-border-subtle bg-panel">
      <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
        <h2 className="text-sm font-semibold text-text-main">知识问答</h2>
        <span className="text-xs text-text-muted">
          共 {messages.length} 条消息
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <Bot className="size-5" />
            </div>
            <p className="text-sm font-medium text-text-main">
              Hi，我是知识问答助手
            </p>
            <p className="text-xs text-text-muted">
              我可以阅读知识库的资料并使用自然语言回答你的问题。
            </p>
          </div>
        )}

        {messages.map((message) =>
          message.role === 'user' ? (
            <div key={message.id} className="flex justify-end">
              <div className="max-w-[80%] rounded-lg rounded-tr-sm bg-primary-500 px-3.5 py-2.5 text-sm leading-relaxed text-white">
                {message.content}
              </div>
            </div>
          ) : (
            <div key={message.id} className="flex items-start gap-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                <Bot className="size-4" />
              </div>
              <div className="max-w-[85%] space-y-2">
                <div className="rounded-lg rounded-tl-sm border border-border-subtle bg-page px-3.5 py-2.5 prose prose-sm max-w-none text-text-main [&_p]:leading-relaxed [&_p]:my-1 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[13px] [&_pre]:my-2 [&_pre]:rounded-md [&_pre]:bg-[#1e1e1e] [&_pre]:p-3 [&_pre]:text-white [&_pre_code]:bg-transparent [&_pre_code]:p-0">
                  {message.content ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  ) : loading ? (
                    <span className="inline-flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:-0.3s]"></span>
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:-0.15s]"></span>
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted"></span>
                    </span>
                  ) : (
                    <span className="text-text-muted">已停止</span>
                  )}
                </div>
                {message.sources && message.sources.length > 0 && (
                  <div className="text-xs text-text-muted">
                    引用 {message.sources.length} 个切片
                  </div>
                )}
              </div>
            </div>
          ),
        )}
      </div>

      <div className="border-t border-border-subtle p-3">
        <InputGroup>
          <InputGroupTextarea
            value={input}
            maxLength={80}
            rows={3}
            placeholder="输入问题..."
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          <InputGroupAddon align="block-end" className="justify-between">
            <InputGroupText>{input.length}/80</InputGroupText>
            <InputGroupButton
              variant={loading ? 'destructive' : 'default'}
              size="icon-sm"
              onClick={loading ? () => stop() : handleSend}
              disabled={!loading && !input.trim()}
              title={loading ? '停止生成' : '发送'}
              aria-label={loading ? '停止生成' : '发送'}
            >
              {loading ? <Square /> : <Send />}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  )
}
