import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Bot, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useChatStore } from '@/store/chat'

export default function ChatPanel() {
  const messages = useChatStore((state) => state.messages)
  const sendMessage = useChatStore((state) => state.sendMessage)
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
    sendMessage(input.trim())
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
                <div className="rounded-lg rounded-tl-sm border border-border-subtle bg-page px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line text-text-main">
                  {message.content}
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
        <Textarea
          value={input}
          maxLength={80}
          rows={3}
          className="resize-none field-sizing-fixed"
          placeholder="输入问题，例如：小王销售业绩是多少？"
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-text-muted">{input.length}/80</span>
          <Button size="sm" onClick={handleSend} disabled={!input.trim()}>
            <Send />
            发送
          </Button>
        </div>
      </div>
    </div>
  )
}
