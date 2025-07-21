import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
    MessageCircle,
    Phone,
    Send,
    Paperclip,
    Camera,
    MapPin,
    Clock,
    CheckCircle,
    AlertCircle,
    User,
    Truck,
    Image as ImageIcon,
    Download,
    X
} from 'lucide-react';

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

export default function CommunicationCenter({ 
    trackingNumber, 
    driver, 
    messages, 
    onSendMessage, 
    onCallDriver,
    className = '' 
}: Props) {
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
        setSelectedImages(prev => [...prev, ...files]);
        setShowImagePreview(true);
    };

    const removeSelectedImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        if (selectedImages.length === 1) {
            setShowImagePreview(false);
        }
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <CardTitle className="text-lg sm:text-xl flex items-center">
                            <MessageCircle className="h-5 w-5 mr-2" />
                            Communication Center
                        </CardTitle>
                        <CardDescription>
                            Chat with your delivery driver • {trackingNumber}
                        </CardDescription>
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
                                    <Badge className={`${getStatusColor(driver.status)} text-xs`}>
                                        {driver.status}
                                    </Badge>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onCallDriver}
                                className="flex-shrink-0"
                            >
                                <Phone className="h-4 w-4 mr-2" />
                                Call
                            </Button>
                        </div>
                    )}
                </div>

                {/* Driver Status Bar - Mobile */}
                {driver && (
                    <div className="sm:hidden flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3">
                            <Truck className="h-4 w-4 text-blue-600" />
                            <div>
                                <p className="text-sm font-medium text-blue-900">{driver.name}</p>
                                <p className="text-xs text-blue-700">{driver.vehicle}</p>
                            </div>
                        </div>
                        <Badge className={`${getStatusColor(driver.status)} text-xs`}>
                            {driver.status}
                        </Badge>
                    </div>
                )}
            </CardHeader>

            <CardContent className="p-0">
                {/* Messages Container - Mobile Optimized */}
                <div className="h-64 sm:h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.length === 0 ? (
                        <div className="text-center py-8">
                            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No messages yet</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Start a conversation with your driver
                            </p>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${
                                    message.sender === 'customer' ? 'justify-end' : 'justify-start'
                                }`}
                            >
                                <div
                                    className={`max-w-xs sm:max-w-sm lg:max-w-md px-4 py-2 rounded-lg ${
                                        message.sender === 'customer'
                                            ? 'bg-blue-600 text-white'
                                            : message.sender === 'system'
                                            ? 'bg-gray-200 text-gray-800'
                                            : 'bg-white text-gray-900 border'
                                    }`}
                                >
                                    {/* Message Header */}
                                    {message.sender !== 'customer' && message.sender !== 'system' && (
                                        <div className="flex items-center gap-2 mb-1">
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
                                    {message.type === 'text' && (
                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                    )}

                                    {message.type === 'image' && message.attachments && (
                                        <div className="space-y-2">
                                            {message.content && (
                                                <p className="text-sm">{message.content}</p>
                                            )}
                                            <div className="grid grid-cols-2 gap-2">
                                                {message.attachments.map((attachment, index) => (
                                                    <div key={index} className="relative group">
                                                        <img
                                                            src={attachment.url}
                                                            alt={attachment.name}
                                                            className="w-full h-20 object-cover rounded cursor-pointer"
                                                            onClick={() => window.open(attachment.url, '_blank')}
                                                        />
                                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded flex items-center justify-center">
                                                            <Download className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
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
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-xs opacity-70">
                                            {formatTime(message.timestamp)}
                                        </span>
                                        {message.sender === 'customer' && (
                                            <CheckCircle className={`h-3 w-3 ${
                                                message.read ? 'text-blue-300' : 'text-blue-400'
                                            }`} />
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
                    <div className="p-4 bg-blue-50 border-t border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-blue-900">
                                Selected Images ({selectedImages.length})
                            </span>
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
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {selectedImages.map((file, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={file.name}
                                        className="w-full h-16 object-cover rounded border"
                                    />
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
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
                <div className="p-4 border-t bg-white">
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <Textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                className="min-h-[40px] max-h-24 resize-none text-base sm:text-sm"
                                disabled={!driver}
                            />
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageSelect}
                                className="hidden"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={!driver}
                                className="p-2"
                            >
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
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span>{driver?.name} is typing...</span>
                        </div>
                    )}

                    {/* No Driver Notice */}
                    {!driver && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                            <AlertCircle className="h-4 w-4 inline mr-2" />
                            Driver will be assigned when your package is out for delivery
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
