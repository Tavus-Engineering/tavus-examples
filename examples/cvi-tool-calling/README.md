# Tavus CVI Tool Calling Example - Shopping Assistant

This Next.js application demonstrates **Conversational Video Interface (CVI) tool calling** with Tavus AI replicas. It showcases how to build an interactive shopping assistant that can add items to a cart through natural conversation.

## 🎯 What This Example Demonstrates

- **LLM Tool Calling**: AI replica can execute functions based on user speech
- **Real-time Video Conversation**: Interactive video chat with Tavus AI replica
- **Shopping Cart Integration**: Add products to cart through voice commands
- **Event-driven Architecture**: Handle tool calls via WebSocket app messages

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd cvi-tool-calling
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```bash
TAVUS_API_KEY=your_tavus_api_key_here
TAVUS_PERSONA_ID=your_persona_id_here
```

**Get your credentials:**
- **API Key**: Get from [Tavus Developer Portal](https://platform.tavus.io/)
- **Persona ID**: Create at [Tavus Persona Creation](https://platform.tavus.io/personas/create)

### 3. Create Your Persona

Go to [https://platform.tavus.io/personas/create](https://platform.tavus.io/personas/create) and create a new persona with the following configuration:

#### System Prompt
```
You are Tavus Shopping Guide, a friendly and knowledgeable assistant.  

Your purpose is to help customers by:  
- Explaining the Tavus product information provided in the context.  
- Providing accurate pricing information from the context when asked.  

Guidelines:  
- All product and pricing information is available in the context — do not invent or assume details.  
- Always be helpful, supportive, and customer-focused.  
- Keep responses professional but approachable — like a helpful store associate.  
- When unsure or if information is missing from the context, Tell the customer to check website and add manually.

Tool usage:  
- If a customer asks to add an item, first confirm the product name and quantity with them.  
- After explicit confirmation, call the `add_to_cart` tool with the correct parameters.  
- Never call the tool without confirmation.
```

#### LLM Configuration
- **Model**: `tavus-gpt-4o`
- **Tools**: Add the following tool configuration:

```json
[
  {
    "type": "function",
    "function": {
      "name": "add_to_cart",
      "parameters": {
        "type": "object",
        "required": [
          "item_name"
        ],
        "properties": {
          "quantity": {
            "type": "number",
            "description": "The number of units to add to the cart. Defaults to 1 if not specified."
          },
          "item_name": {
            "type": "string",
            "description": "The exact name of the product to add to the cart (e.g., 'Bananas', 'Almond Milk', 'Whole Wheat Bread')."
          }
        }
      },
      "description": "Adds a specific product from the available catalog to the customer's shopping cart. Always confirm the item name and quantity with the customer before calling this function."
    }
  }
]
```

### 4. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start shopping with your AI assistant!

## 🛠 How Tool Calling Works

### Overview

Tool calling in Tavus CVI allows the AI replica to execute functions based on user speech. Here's the complete flow:

1. **User speaks** to the AI replica (e.g., "Add bananas to my cart")
2. **LLM processes** the speech and determines if a tool should be called
3. **Tavus sends** a `conversation.tool_call` event via WebSocket
4. **Client receives** the event and executes the function
5. **Client responds** with results via `conversation.echo` event
6. **AI replica** speaks the response to the user

### Technical Implementation

#### 1. Tool Call Event Reception

The tool call events are received in `VideoBox.tsx` via Daily.js app messages:

```typescript
// Listen for app messages from Tavus
call.on('app-message', (event) => {
  if (event.data && event.data.event_type === 'conversation.tool_call') {
    handleToolCall(event)
  }
})
```

#### 2. Tool Call Processing

When a tool call is received, the application:

```typescript
const handleToolCall = async (event) => {
  const { conversation_id, properties } = event.data
  const { name, arguments: args } = properties
  
  // Parse arguments and execute function
  const parsedArgs = JSON.parse(args)
  
  switch (name) {
    case 'add_to_cart':
      // Find item in catalog
      const foundItem = shoppingItems.find(item => 
        item.name.toLowerCase().includes(parsedArgs.item_name.toLowerCase())
      )
      
      if (foundItem) {
        // Add to cart
        onAddToCart(foundItem, parsedArgs.quantity || 1)
        result = `Added ${foundItem.name} to your cart!`
      } else {
        result = `Sorry, I couldn't find "${parsedArgs.item_name}" in our store.`
      }
      break
  }
  
  // Send response back to Tavus
  call.sendAppMessage({
    message_type: 'conversation',
    event_type: 'conversation.echo',
    conversation_id: conversation_id,
    properties: {
      modality: 'text',
      text: result,
      done: true
    }
  }, '*')
}
```

#### 3. Event Schema

The tool call event follows this schema (as per [Tavus documentation](https://docs.tavus.io/sections/event-schemas/conversation-toolcall)):

```typescript
{
  "message_type": "conversation",
  "event_type": "conversation.tool_call",
  "conversation_id": "c123456",
  "inference_id": "83294d9f-8306-491b-a284-791f56c8383f",
  "properties": {
    "name": "add_to_cart",
    "arguments": "{\"item_name\": \"Bananas\", \"quantity\": 2}"
  }
}
```

## 🏗 Architecture

### Project Structure

```
src/
├── app/
│   ├── api/tavus/conversation/    # Tavus API integration
│   │   └── route.ts              # Creates conversations
│   ├── page.tsx                  # Main shopping interface
│   └── layout.tsx                # App layout
├── components/
│   ├── VideoBox.tsx              # Video chat + tool call handling
│   ├── Cart.tsx                  # Shopping cart UI
│   ├── ShoppingItemCard.tsx      # Product display
│   └── ui/                       # shadcn/ui components
├── hooks/
│   └── useTavusConversation.ts   # Conversation state management
├── types/
│   ├── tavus.ts                  # Tavus API types
│   ├── tool-calls.ts             # Tool calling types
│   └── shopping.ts               # Shopping data types
└── data/
    └── shopping-items.ts         # Product catalog
```

### Key Components

#### VideoBox Component
- **Location**: `src/components/VideoBox.tsx`
- **Purpose**: Handles video rendering and tool call processing
- **Key Features**:
  - Daily.js integration for video streaming
  - WebSocket message handling for tool calls
  - Draggable and resizable video interface

#### Conversation API Route
- **Location**: `src/app/api/tavus/conversation/route.ts`
- **Purpose**: Creates Tavus conversations with proper configuration
- **Features**:
  - Environment variable validation
  - Conversation timeout settings
  - Error handling

#### Shopping Integration
- **Cart State**: Managed in main page component
- **Product Catalog**: Static data in `src/data/shopping-items.ts`
- **Tool Execution**: Bridges AI commands to cart actions

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `TAVUS_API_KEY` | Your Tavus API key from the developer portal | ✅ |
| `TAVUS_PERSONA_ID` | ID of your configured persona | ✅ |

### Persona Configuration

Your persona must be configured with:
- **LLM Model**: `tavus-gpt-4o`
- **System Prompt**: Shopping assistant instructions
- **Tools**: `add_to_cart` function definition
- **Context**: Product catalog information

## 📚 Learn More

### Tavus Documentation
- [Tool Calling for LLM](https://docs.tavus.io/sections/conversational-video-interface/persona/llm-tool)
- [Tool Call Event Schema](https://docs.tavus.io/sections/event-schemas/conversation-toolcall)
- [Persona Creation Guide](https://platform.tavus.io/personas/create)

### Next.js Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

## 🤝 Support

- [Tavus Status Page](https://status.tavus.io) — Check real-time system status
- [Tavus Documentation](https://docs.tavus.io/sections/introduction) — Full API and platform docs
- [Contact Sales](https://www.tavus.io/demo) — Book a demo or reach out to our team

**Need help?**  
Email us at [support@tavus.io](mailto:support@tavus.io) or join the [Tavus Discord Community](https://discord.gg/tavus) for support and discussion.