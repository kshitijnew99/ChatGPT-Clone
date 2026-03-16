import React from 'react'

const formatMessage = (text) => {
  if (!text) return ''
  
  // Convert **text** to <strong>text</strong>
  let formatted = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  
  // Convert *text* to <em>text</em>
  formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>')
  
  // Convert line breaks to <br>
  formatted = formatted.replace(/\n/g, '<br>')
  
  return formatted
}

const ChatMessages = ({ messages, endRef }) => {
  return (
    <div className="chat-messages">
      <ul className="chat-listview">
        {messages.map(m => (
          <li key={m.id} className={`chat-row ${m.role === 'user' ? 'user' : 'ai'}`}>
            <div 
              className={`chat-bubble ${m.role === 'user' ? 'user' : 'ai'}`}
              dangerouslySetInnerHTML={{ __html: formatMessage(m.text) }}
            />
          </li>
        ))}
        <li ref={endRef} />
      </ul>
    </div>
  )
}

export default ChatMessages
