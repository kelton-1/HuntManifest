/**
 * AI Inventory Assistant
 * Chat interface for natural language inventory management
 */

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, Send, X, Loader2, Package, Plus, Trash2, Search } from "lucide-react";
import { useInventory } from "@/lib/storage";
import { InventoryItem, INVENTORY_CATEGORIES, InventoryCategory } from "@/lib/types";
import { geminiModel } from "@/lib/gemini";

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    actions?: InventoryAction[];
    timestamp: Date;
}

interface InventoryAction {
    type: 'add' | 'delete' | 'update' | 'query';
    item?: Partial<InventoryItem>;
    itemId?: string;
    results?: InventoryItem[];
    executed?: boolean;
}

interface AIAssistantProps {
    isOpen: boolean;
    onClose: () => void;
}

// System prompt for inventory assistant
const SYSTEM_PROMPT = `You are an inventory assistant for a waterfowl hunting gear management app called HuntManifest.

You help users manage their hunting gear inventory through natural language. You can:
1. Add items to inventory (decoys, firearms, ammo, calls, waders, clothing, blinds, safety gear, dog gear, vehicles)
2. Query/search inventory ("what ammo do I have?", "show my decoys")
3. Delete items 
4. Update quantities or details

When the user wants to ADD an item, respond with JSON in this format:
{"action": "add", "item": {"name": "...", "category": "...", "quantity": 1, "brand": "...", "notes": "..."}}

When the user wants to QUERY, respond with:
{"action": "query", "category": "..." or "all", "searchTerm": "..."}

When the user wants to DELETE, respond with:
{"action": "delete", "searchTerm": "..."}

Categories: ${INVENTORY_CATEGORIES.join(', ')}

Always be concise and helpful. If you can't parse the request, ask for clarification.
After the JSON, you can add a brief natural language response on a new line.`;

export function AIAssistant({ isOpen, onClose }: AIAssistantProps) {
    const { inventory, addItem, deleteItem } = useInventory();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Parse AI response for actions
    const parseResponse = useCallback((response: string): { actions: InventoryAction[]; text: string } => {
        const actions: InventoryAction[] = [];
        let text = response;

        // Try to extract JSON from response
        const jsonMatch = response.match(/\{[\s\S]*?\}/g);
        if (jsonMatch) {
            for (const jsonStr of jsonMatch) {
                try {
                    const parsed = JSON.parse(jsonStr);
                    if (parsed.action === 'add' && parsed.item) {
                        actions.push({
                            type: 'add',
                            item: {
                                name: parsed.item.name,
                                category: parsed.item.category as InventoryCategory,
                                quantity: parsed.item.quantity || 1,
                                specs: {
                                    brand: parsed.item.brand,
                                    notes: parsed.item.notes,
                                },
                            },
                        });
                    } else if (parsed.action === 'query') {
                        const results = inventory.filter(item => {
                            if (parsed.category && parsed.category !== 'all' && item.category !== parsed.category) {
                                return false;
                            }
                            if (parsed.searchTerm) {
                                return item.name.toLowerCase().includes(parsed.searchTerm.toLowerCase());
                            }
                            return true;
                        });
                        actions.push({
                            type: 'query',
                            results,
                        });
                    } else if (parsed.action === 'delete' && parsed.searchTerm) {
                        const match = inventory.find(item =>
                            item.name.toLowerCase().includes(parsed.searchTerm.toLowerCase())
                        );
                        if (match) {
                            actions.push({
                                type: 'delete',
                                itemId: match.id,
                                item: match,
                            });
                        }
                    }
                    // Remove JSON from text
                    text = text.replace(jsonStr, '').trim();
                } catch {
                    // Not valid JSON, skip
                }
            }
        }

        return { actions, text };
    }, [inventory]);

    // Execute an action
    const executeAction = useCallback(async (action: InventoryAction) => {
        if (action.type === 'add' && action.item) {
            const newItem: InventoryItem = {
                id: crypto.randomUUID(),
                name: action.item.name || 'Unnamed Item',
                category: action.item.category || 'Other',
                quantity: action.item.quantity || 1,
                status: 'READY',
                specs: action.item.specs || {},
                createdAt: new Date(),
            };
            await addItem(newItem);
            return true;
        } else if (action.type === 'delete' && action.itemId) {
            await deleteItem(action.itemId);
            return true;
        }
        return false;
    }, [addItem, deleteItem]);

    // Send message
    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Build context
            const inventorySummary = INVENTORY_CATEGORIES.map(cat => {
                const items = inventory.filter(i => i.category === cat);
                return items.length > 0 ? `${cat}: ${items.length} items` : null;
            }).filter(Boolean).join(', ');

            const prompt = `${SYSTEM_PROMPT}

Current inventory summary: ${inventorySummary || 'Empty'}

User: ${input.trim()}

Respond with JSON action (if applicable) followed by brief text response:`;

            const result = await geminiModel.generateContent(prompt);
            const responseText = result.response.text();

            const { actions, text } = parseResponse(responseText);

            const assistantMessage: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: text || 'Done!',
                actions,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('AI error:', error);
            setMessages(prev => [...prev, {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date(),
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle action execution
    const handleExecuteAction = async (messageId: string, actionIndex: number) => {
        const message = messages.find(m => m.id === messageId);
        if (!message?.actions?.[actionIndex]) return;

        const action = message.actions[actionIndex];
        const success = await executeAction(action);

        if (success) {
            // Mark action as executed
            setMessages(prev => prev.map(m => {
                if (m.id === messageId && m.actions) {
                    const newActions = [...m.actions];
                    newActions[actionIndex] = { ...newActions[actionIndex], executed: true };
                    return { ...m, actions: newActions };
                }
                return m;
            }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-lg bg-background rounded-t-3xl shadow-2xl flex flex-col max-h-[80vh] animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="font-bold">Inventory Assistant</h2>
                            <p className="text-xs text-muted-foreground">{inventory.length} items in inventory</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-secondary transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm font-medium">Ask me to manage your inventory</p>
                            <p className="text-xs mt-1">Try: "Add 2 dozen mallard decoys"</p>
                        </div>
                    )}

                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-secondary text-foreground'
                                    }`}
                            >
                                <p className="text-sm">{message.content}</p>

                                {/* Action buttons */}
                                {message.actions?.map((action, idx) => (
                                    <div key={idx} className="mt-3 pt-3 border-t border-border/30">
                                        {action.type === 'add' && !action.executed && (
                                            <button
                                                onClick={() => handleExecuteAction(message.id, idx)}
                                                className="flex items-center gap-2 text-xs bg-primary text-primary-foreground px-3 py-2 rounded-lg hover:bg-primary/90"
                                            >
                                                <Plus className="h-3 w-3" />
                                                Add {action.item?.name}
                                            </button>
                                        )}
                                        {action.type === 'add' && action.executed && (
                                            <p className="text-xs text-green-600 flex items-center gap-1">
                                                <Package className="h-3 w-3" /> Added to inventory
                                            </p>
                                        )}
                                        {action.type === 'delete' && !action.executed && (
                                            <button
                                                onClick={() => handleExecuteAction(message.id, idx)}
                                                className="flex items-center gap-2 text-xs bg-destructive text-destructive-foreground px-3 py-2 rounded-lg"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                                Delete {action.item?.name}
                                            </button>
                                        )}
                                        {action.type === 'delete' && action.executed && (
                                            <p className="text-xs text-red-600">Deleted</p>
                                        )}
                                        {action.type === 'query' && action.results && (
                                            <div className="text-xs space-y-1">
                                                <p className="font-medium flex items-center gap-1">
                                                    <Search className="h-3 w-3" />
                                                    Found {action.results.length} items:
                                                </p>
                                                {action.results.slice(0, 5).map(item => (
                                                    <p key={item.id} className="pl-4">• {item.name}</p>
                                                ))}
                                                {action.results.length > 5 && (
                                                    <p className="pl-4 text-muted-foreground">
                                                        ...and {action.results.length - 5} more
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-secondary rounded-2xl px-4 py-3">
                                <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Add 2 dozen mallard decoys..."
                            disabled={isLoading}
                            className="flex-1 rounded-xl border border-input bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || isLoading}
                            className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 hover:bg-primary/90 transition-colors"
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
