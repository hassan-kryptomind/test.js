// ai-chatbot.js - CDN-ready version
(function() {
  // Create namespace to avoid conflicts
  if (typeof window.AIChatbot === 'undefined') {
    // Default configuration
    window.AIChatbot = {
      botName: 'AI Assistant',
      primaryColor: '#8559DA',
      welcomeMessage: 'Hi there! How can I help you today?',
      placeholderText: 'Type your message...',
      apiEndpoint: null,
      initialized: false
    };
    
    // Main initialization function
    window.AIChatbot.init = function(config) {
      // Prevent multiple initializations
      if (window.AIChatbot.initialized) return;
      
      // Merge user config with defaults
      if (config) {
        Object.keys(config).forEach(key => {
          window.AIChatbot[key] = config[key];
        });
      }
      
      // Create and inject stylesheet
      const injectStyles = () => {
        const style = document.createElement('style');
        style.innerHTML = `
          .ai-chat-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column-reverse;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .chat-window {
            width: 360px;
            height: 500px;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            margin-bottom: 16px;
            transition: all 0.3s ease;
            opacity: 0;
            transform: translateY(20px);
            pointer-events: none;
          }
          .chat-window.active {
            opacity: 1;
            transform: translateY(0);
            pointer-events: all;
          }
          .chat-header {
            background-color: ${window.AIChatbot.primaryColor};
            color: white;
            padding: 16px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .header-title {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .header-title h3 {
            font-size: 16px;
            font-weight: 600;
            margin: 0;
          }
          .avatar {
            width: 32px;
            height: 32px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
          }
          .close-btn {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
          }
          .chat-messages {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          .message {
            max-width: 80%;
            padding: 12px 16px;
            border-radius: 16px;
            position: relative;
            line-height: 1.5;
            font-size: 14px;
          }
          .bot-message {
            background: #f0f0f0;
            color: #333;
            align-self: flex-start;
            border-bottom-left-radius: 4px;
          }
          .user-message {
            background: ${window.AIChatbot.primaryColor};
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 4px;
          }
          .chat-input {
            padding: 12px 16px;
            border-top: 1px solid #eee;
            display: flex;
            background: #f9f9f9;
          }
          .chat-input input {
            flex: 1;
            padding: 10px 16px;
            border: 1px solid #ddd;
            border-radius: 24px;
            outline: none;
            font-size: 14px;
          }
          .send-btn {
            width: 36px;
            height: 36px;
            background: ${window.AIChatbot.primaryColor};
            color: white;
            border: none;
            border-radius: 50%;
            margin-left: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .toggle-chat {
            width: 60px;
            height: 60px;
            background: ${window.AIChatbot.primaryColor};
            border-radius: 50%;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            color: white;
            border: none;
            font-size: 24px;
            cursor: pointer;
            align-self: flex-end;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s ease;
          }
          .toggle-chat:hover {
            transform: scale(1.05);
          }
          .toggle-chat .close {
            display: none;
          }
          .toggle-chat.active .open {
            display: none;
          }
          .toggle-chat.active .close {
            display: block;
          }
          .typing-indicator {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 6px 12px;
            background: #f0f0f0;
            border-radius: 16px;
            align-self: flex-start;
            margin-top: 8px;
            width: fit-content;
          }
          .typing-indicator span {
            width: 8px;
            height: 8px;
            background: #888;
            border-radius: 50%;
            display: block;
            animation: typing 1.4s infinite both;
          }
          .typing-indicator span:nth-child(2) {
            animation-delay: 0.2s;
          }
          .typing-indicator span:nth-child(3) {
            animation-delay: 0.4s;
          }
          @keyframes typing {
            0% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
            100% { transform: translateY(0); }
          }
        `;
        document.head.appendChild(style);
      };

      // Create the widget HTML
      const createWidget = () => {
        const widget = document.createElement('div');
        widget.className = 'ai-chat-widget';
        widget.innerHTML = `
          <button class="toggle-chat">
            <span class="open">💬</span>
            <span class="close">✕</span>
          </button>
          <div class="chat-window">
            <div class="chat-header">
              <div class="header-title">
                <div class="avatar">AI</div>
                <h3>${window.AIChatbot.botName}</h3>
              </div>
              <button class="close-btn">✕</button>
            </div>
            <div class="chat-messages">
              <div class="message bot-message">
                ${window.AIChatbot.welcomeMessage}
              </div>
            </div>
            <div class="chat-input">
              <input type="text" placeholder="${window.AIChatbot.placeholderText}">
              <button class="send-btn">→</button>
            </div>
          </div>
        `;
        document.body.appendChild(widget);
        return widget;
      };

      // Add typing indicator
      const showTypingIndicator = (messagesContainer) => {
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.innerHTML = '<span></span><span></span><span></span>';
        messagesContainer.appendChild(indicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return indicator;
      };

      // Remove typing indicator
      const removeTypingIndicator = (indicator) => {
        if (indicator && indicator.parentNode) {
          indicator.parentNode.removeChild(indicator);
        }
      };

      // Process messages with API
      const processMessage = async (message) => {
        // If API endpoint is set, use it
        if (window.AIChatbot.apiEndpoint) {
          try {
            const response = await fetch(window.AIChatbot.apiEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ message }),
            });
            const data = await response.json();
            return data.response || "Sorry, I couldn't process your request.";
          } catch (error) {
            console.error('AI Chatbot API Error:', error);
            return "I'm having trouble connecting to my brain. Please try again later.";
          }
        } 
        
        // Fallback responses if no API is set
        if (message.toLowerCase().includes('hi') || message.toLowerCase().includes('hello')) {
          return "Hello! How can I assist you today?";
        } else if (message.toLowerCase().includes('help')) {
          return "I'm here to help! What do you need assistance with?";
        } else if (message.toLowerCase().includes('thank')) {
          return "You're welcome! Is there anything else I can help with?";
        } else {
          return "That's a great question! I'd be happy to help with that. Could you provide more details?";
        }
      };

      // Initialize the widget
      injectStyles();
      const widget = createWidget();
      const toggleBtn = widget.querySelector('.toggle-chat');
      const chatWindow = widget.querySelector('.chat-window');
      const closeBtn = widget.querySelector('.close-btn');
      const sendBtn = widget.querySelector('.send-btn');
      const input = widget.querySelector('.chat-input input');
      const messagesContainer = widget.querySelector('.chat-messages');

      // Toggle chat window
      toggleBtn.addEventListener('click', () => {
        chatWindow.classList.toggle('active');
        toggleBtn.classList.toggle('active');
        if (chatWindow.classList.contains('active')) {
          input.focus();
        }
      });

      // Close chat window
      closeBtn.addEventListener('click', () => {
        chatWindow.classList.remove('active');
        toggleBtn.classList.remove('active');
      });

      // Send message function
      const sendMessage = async () => {
        const message = input.value.trim();
        if (message) {
          // Add user message
          addMessage(message, 'user');
          
          // Clear input
          input.value = '';
          
          // Show typing indicator
          const typingIndicator = showTypingIndicator(messagesContainer);
          
          // Process the message (with API or fallback)
          const response = await processMessage(message);
          
          // Remove typing indicator and add bot response
          setTimeout(() => {
            removeTypingIndicator(typingIndicator);
            addMessage(response, 'bot');
          }, 1000);
        }
      };

      // Add message to chat
      const addMessage = (text, sender) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.textContent = text;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Save conversation in session storage
        saveConversation(text, sender);
      };

      // Save conversation to session storage
      const saveConversation = (text, sender) => {
        let conversation = JSON.parse(sessionStorage.getItem('ai_chatbot_conversation') || '[]');
        conversation.push({ text, sender, timestamp: new Date().toISOString() });
        sessionStorage.setItem('ai_chatbot_conversation', JSON.stringify(conversation));
      };

      // Load conversation from session storage
      const loadConversation = () => {
        const conversation = JSON.parse(sessionStorage.getItem('ai_chatbot_conversation') || '[]');
        if (conversation.length > 0) {
          // Clear default welcome message
          messagesContainer.innerHTML = '';
          // Populate with saved messages
          conversation.forEach(msg => {
            addMessage(msg.text, msg.sender);
          });
        }
      };

      // Event listeners
      sendBtn.addEventListener('click', sendMessage);
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
      });

      // Load previous conversation if any
      loadConversation();

      // Expose public methods
      window.AIChatbot.open = () => {
        chatWindow.classList.add('active');
        toggleBtn.classList.add('active');
        input.focus();
      };

      window.AIChatbot.close = () => {
        chatWindow.classList.remove('active');
        toggleBtn.classList.remove('active');
      };

      window.AIChatbot.toggle = () => {
        chatWindow.classList.toggle('active');
        toggleBtn.classList.toggle('active');
        if (chatWindow.classList.contains('active')) {
          input.focus();
        }
      };

      window.AIChatbot.sendMessage = (text) => {
        if (text) {
          input.value = text;
          sendMessage();
        }
      };
      
      window.AIChatbot.initialized = true;
    };
  }
  
  // Auto-initialize if data attributes are present
  const scripts = document.getElementsByTagName('script');
  const currentScript = scripts[scripts.length - 1];
  
  if (currentScript.hasAttribute('data-autoload') && 
      currentScript.getAttribute('data-autoload') !== 'false') {
    // Extract config from data attributes
    const config = {};
    for (const attr of currentScript.attributes) {
      if (attr.name.startsWith('data-')) {
        const key = attr.name.replace('data-', '');
        if (key !== 'autoload') {
          config[key] = attr.value;
        }
      }
    }
    
    // Initialize when DOM is fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => window.AIChatbot.init(config));
    } else {
      window.AIChatbot.init(config);
    }
  }
})();
