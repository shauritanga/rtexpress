import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Camera, CheckCircle, Download, MapPin, MessageCircle, Phone, Send, Truck, User, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface Message {
    id: string;
    sender: 'customer' | 'driver' | 'system';
    content: string;
    timestamp: string;
    type: 'text' | 'image' | 'location' | 'system';
    attachments?: {
        type: 'image' | 'document';
        url: string;
        name: string;
    }[];
    read: boolean;
}

interface Driver {
    id: string;
    name: string;
    phone: string;
    photo?: string;
    vehicle: string;
    status: 'online' | 'offline' | 'busy';
    location?: {
        lat: number;
        lng: number;
        address: string;
    };
}

interface Props {
    trackingNumber: string;
    driver?: Driver;
    messages: Message[];
    onSendMessage: (content: string, type: 'text' | 'image', attachments?: File[]) => void;
    onCallDriver: () => void;
    className?: string;
}

export default function CommunicationCenter({ trackingNumber, driver, messages, onSendMessage, onCallDriver, className = '' }: Props) {
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [showImagePreview, setShowImagePreview] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = () => {
        if (newMessage.trim() || selectedImages.length > 0) {
            onSendMessage(newMessage.trim(), selectedImages.length > 0 ? 'image' : 'text', selectedImages);
            setNewMessage('');
            setSelectedImages([]);
            setShowImagePreview(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedImages((prev) => [...prev, ...files]);
        setShowImagePreview(true);
    };

    const removeSelectedImage = (index: number) => {
        setSelectedImages((prev) => prev.filter((_, i) => i !== index));
        if (selectedImages.length === 1) {
            setShowImagePreview(false);
        }
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusColor = (status: string) => {
        const colors = {
            online: 'bg-green-100 text-green-800 border-green-300',
            offline: 'bg-gray-100 text-gray-800 border-gray-300',
            busy: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    return (
        <Card className={className}>
            <CardHeader className="pb-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="flex items-center text-lg sm:text-xl">
                            <MessageCircle className="mr-2 h-5 w-5" />
                            Communication Center
                        </CardTitle>
                        <CardDescription>Chat with your delivery driver • {trackingNumber}</CardDescription>
                    </div>

                    {/* Driver Info & Actions - Mobile Optimized */}
                    {driver && (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={driver.photo} alt={driver.name} />
                                    <AvatarFallback>
                                        <User className="h-4 w-4" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="hidden sm:block">
                                    <p className="text-sm font-medium">{driver.name}</p>
                                    <Badge className={`${getStatusColor(driver.status)} text-xs`}>{driver.status}</Badge>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={onCallDriver} className="flex-shrink-0">
                                <Phone className="mr-2 h-4 w-4" />
                                Call
                            </Button>
                        </div>
                    )}
                </div>

                {/* Driver Status Bar - Mobile */}
                {driver && (
                    <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-3 sm:hidden">
                        <div className="flex items-center gap-3">
                            <Truck className="h-4 w-4 text-blue-600" />
                            <div>
                                <p className="text-sm font-medium text-blue-900">{driver.name}</p>
                                <p className="text-xs text-blue-700">{driver.vehicle}</p>
                            </div>
                        </div>
                        <Badge className={`${getStatusColor(driver.status)} text-xs`}>{driver.status}</Badge>
                    </div>
                )}
            </CardHeader>

            <CardContent className="p-0">
                {/* Messages Container - Mobile Optimized */}
                <div className="h-64 space-y-4 overflow-y-auto bg-gray-50 p-4 sm:h-80">
                    {messages.length === 0 ? (
                        <div className="py-8 text-center">
                            <MessageCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                            <p className="text-gray-500">No messages yet</p>
                            <p className="mt-1 text-sm text-gray-400">Start a conversation with your driver</p>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div key={message.id} className={`flex ${message.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-xs rounded-lg px-4 py-2 sm:max-w-sm lg:max-w-md ${
                                        message.sender === 'customer'
                                            ? 'bg-blue-600 text-white'
                                            : message.sender === 'system'
                                              ? 'bg-gray-200 text-gray-800'
                                              : 'border bg-white text-gray-900'
                                    }`}
                                >
                                    {/* Message Header */}
                                    {message.sender !== 'customer' && message.sender !== 'system' && (
                                        <div className="mb-1 flex items-center gap-2">
                                            <Avatar className="h-5 w-5">
                                                <AvatarImage src={driver?.photo} alt={driver?.name} />
                                                <AvatarFallback>
                                                    <User className="h-3 w-3" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs font-medium">{driver?.name}</span>
                                        </div>
                                    )}

                                    {/* Message Content */}
                                    {message.type === 'text' && <p className="text-sm whitespace-pre-wrap">{message.content}</p>}

                                    {message.type === 'image' && message.attachments && (
                                        <div className="space-y-2">
                                            {message.content && <p className="text-sm">{message.content}</p>}
                                            <div className="grid grid-cols-2 gap-2">
                                                {message.attachments.map((attachment, index) => (
                                                    <div key={index} className="group relative">
                                                        <img
                                                            src={attachment.url}
                                                            alt={attachment.name}
                                                            className="h-20 w-full cursor-pointer rounded object-cover"
                                                            onClick={() => window.open(attachment.url, '_blank')}
                                                        />
                                                        <div className="bg-opacity-0 group-hover:bg-opacity-20 absolute inset-0 flex items-center justify-center rounded bg-black transition-all">
                                                            <Download className="h-4 w-4 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {message.type === 'location' && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                <span className="text-sm font-medium">Location shared</span>
                                            </div>
                                            <p className="text-xs opacity-90">{message.content}</p>
                                        </div>
                                    )}

                                    {message.type === 'system' && (
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4" />
                                            <span className="text-sm">{message.content}</span>
                                        </div>
                                    )}

                                    {/* Message Footer */}
                                    <div className="mt-1 flex items-center justify-between">
                                        <span className="text-xs opacity-70">{formatTime(message.timestamp)}</span>
                                        {message.sender === 'customer' && (
                                            <CheckCircle className={`h-3 w-3 ${message.read ? 'text-blue-300' : 'text-blue-400'}`} />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Image Preview */}
                {showImagePreview && selectedImages.length > 0 && (
                    <div className="border-t border-blue-200 bg-blue-50 p-4">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-900">Selected Images ({selectedImages.length})</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSelectedImages([]);
                                    setShowImagePreview(false);
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                            {selectedImages.map((file, index) => (
                                <div key={index} className="group relative">
                                    <img src={URL.createObjectURL(file)} alt={file.name} className="h-16 w-full rounded border object-cover" />
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                                        onClick={() => removeSelectedImage(index)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Message Input - Mobile Optimized */}
                <div className="border-t bg-white p-4">
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <Textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                className="max-h-24 min-h-[40px] resize-none text-base sm:text-sm"
                                disabled={!driver}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2">
                            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={!driver} className="p-2">
                                <Camera className="h-4 w-4" />
                            </Button>
                            <Button
                                onClick={handleSendMessage}
                                disabled={(!newMessage.trim() && selectedImages.length === 0) || !driver}
                                className="p-2"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                            <div className="flex gap-1">
                                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.1s' }}></div>
                                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span>{driver?.name} is typing...</span>
                        </div>
                    )}

                    {/* No Driver Notice */}
                    {!driver && (
                        <div className="mt-2 rounded border border-yellow-200 bg-yellow-50 p-2 text-sm text-yellow-800">
                            <AlertCircle className="mr-2 inline h-4 w-4" />
                            Driver will be assigned when your package is out for delivery
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
