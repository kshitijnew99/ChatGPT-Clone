import React from 'react'

const ChatComposer = ({ input, setInput, onSubmit, disabled, variant = 'footer' }) => {
  return (
    <form className={`chat-composer ${variant === 'landing' ? 'landing' : ''}`} onSubmit={onSubmit}>
      <div className={`composer-wrap ${variant === 'landing' ? 'landing' : ''}`}>
        <button
          type="button"
          className="icon-btn"
          title="Attach"
          aria-label="Attach"
          disabled
        >
          📎
        </button>
        <input
          className="composer-input"
          placeholder={variant === 'landing' ? 'Ask anything' : 'Message the AI...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={disabled}
        />
        <button
          className="icon-btn primary"
          type="submit"
          disabled={disabled || !input.trim()}
          title="Send"
          aria-label="Send"
        >
          ➤
        </button>
      </div>
      <div className="composer-hint">Press Enter to send</div>
    </form>
  )
}

export default ChatComposer
