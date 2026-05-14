# AI Assistant Workflow Guide

## 🤖 **Chat Management Strategy**

### **Hybrid Approach (Recommended)**

**Use a hybrid approach for optimal efficiency:**

#### **For Your Work Day:**
- **Start fresh each morning** with a new chat
- **Keep one chat per major feature/task** (e.g., "reliability indicator redesign")
- **Start new chat when switching to completely different work** (e.g., from dashboard changes to survey changes)

#### **When to Start New Chat:**
- ✅ New work day
- ✅ Switching to completely different feature
- ✅ After major architectural changes
- ✅ When conversation gets very long (>50-100 messages)
- ✅ When you notice AI is getting confused or referencing old info

#### **When to Continue Same Chat:**
- ✅ Iterating on the same feature
- ✅ Related changes within same session
- ✅ Building on previous decisions
- ✅ When you need AI to remember specific context

## 💡 **Pro Tips**

1. **Add project context for AI** to Readme with essential information
2. **Always reference the README** at the start of new chats
3. **Summarize current task** briefly in first message
4. **Use clear task boundaries** - "Let's work on X feature" then "Now let's work on Y"
5. **Watch for confusion** - if AI starts referencing old/incorrect info, start fresh

## 🔄 **New Chat for Every Change**

### **Benefits:**
- **Fresh Context**: Each conversation starts with the updated README and current codebase
- **No Confusion**: No risk of AI remembering outdated information or assumptions
- **Focused Scope**: Each chat can be laser-focused on one specific change
- **Clean Slate**: No accumulated context that might interfere with new tasks
- **Better for Complex Changes**: When making significant architectural changes

### **Limitations:**
- **Repetitive Setup**: You'll need to explain the current task each time
- **No Memory of Previous Decisions**: AI won't remember why we made certain choices
- **Context Switching**: You'll need to re-explain the overall goal/progress

## 🗣️ **One Long Chat for Work Day**

### **Benefits:**
- **Continuous Context**: AI remembers all previous decisions and reasoning
- **Efficient Communication**: Can reference previous changes without re-explaining
- **Better for Iterative Work**: Can build on previous changes naturally
- **Understanding of Bigger Picture**: AI maintains awareness of the overall project goals

### **Limitations:**
- **Context Degradation**: AI responses can become less focused over time
- **Memory Limitations**: AI has token limits, so very long conversations might lose early context
- **Potential Confusion**: If we make many changes, AI might reference outdated information
- **Performance**: Very long conversations can slow down response times

## 📋 **Best Practices**

### **Starting a New Chat:**
1. Reference the README.md AI CONTEXT section
2. Briefly describe the current task
3. Mention any recent changes that might be relevant
4. Specify the scope of work for this session

### **During Development:**
1. Keep tasks focused and related
2. If switching to a completely different feature, consider starting fresh
3. Watch for signs of confusion or outdated references
4. Use clear, specific language when describing changes

### **End of Session:**
1. Document any important decisions made
2. Note any context that might be needed for next session
3. Update README if new conventions or rules were established

## 🎯 **Example Workflow**

### **Morning Session:**
```
"Good morning! Working on the Pulse Survey dashboard. 
Current task: Redesigning the reliability indicator to be less controversial.
Recent changes: Hidden Flight Risk card, converted Pulse Score to 1-6 scale.
Scope: Focus on reliability indicator redesign only."
```

### **Afternoon Session (Same Day, Different Feature):**
```
"Switching to survey integration work. 
Current task: Improving survey window communication.
Previous work: Reliability indicator redesign (completed).
Scope: Survey window messaging and user experience."
```

### **Next Day:**
```
"New day, working on Pulse Survey dashboard.
Current task: Adding export functionality.
Recent changes: Reliability indicator redesigned, survey integration improved.
Scope: PDF export feature implementation."
```

---

**Note**: This workflow is specifically designed for this static HTML/CSS/JavaScript frontend project. Adjust based on project complexity and team preferences. 