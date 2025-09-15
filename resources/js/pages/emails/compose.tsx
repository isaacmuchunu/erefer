import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import {
    Send,
    Paperclip,
    Save,
    X,
    Plus,
    Users,
    Clock,
    FileText
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Communications',
        href: '/communications',
    },
    {
        title: 'Email',
        href: '/emails',
    },
    {
        title: 'Compose',
        href: '/emails/compose',
    },
];

interface ComposeEmailProps {
    auth: {
        user: any;
    };
    contacts?: any[];
    templates?: any[];
    prefill?: {
        to?: string;
        subject?: string;
        referral_id?: string;
    };
}

export default function ComposeEmail(props: ComposeEmailProps) {
    const { user } = props.auth;
    const { contacts = [], templates = [], prefill = {} } = props;

    const [formData, setFormData] = useState({
        to: prefill.to ? [prefill.to] : [],
        cc: [],
        bcc: [],
        subject: prefill.subject || '',
        body_html: '',
        body_text: '',
        template_id: '',
        referral_id: prefill.referral_id || '',
        send_at: '',
        attachments: []
    });

    const [toInput, setToInput] = useState('');
    const [ccInput, setCcInput] = useState('');
    const [bccInput, setBccInput] = useState('');
    const [showCc, setShowCc] = useState(false);
    const [showBcc, setShowBcc] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleAddRecipient = (type: 'to' | 'cc' | 'bcc', email: string) => {
        if (email && !formData[type].includes(email)) {
            setFormData(prev => ({
                ...prev,
                [type]: [...prev[type], email]
            }));
            
            if (type === 'to') setToInput('');
            if (type === 'cc') setCcInput('');
            if (type === 'bcc') setBccInput('');
        }
    };

    const handleRemoveRecipient = (type: 'to' | 'cc' | 'bcc', email: string) => {
        setFormData(prev => ({
            ...prev,
            [type]: prev[type].filter(e => e !== email)
        }));
    };

    const handleTemplateSelect = (templateId: string) => {
        const template = templates.find(t => t.id === parseInt(templateId));
        if (template) {
            setFormData(prev => ({
                ...prev,
                template_id: templateId,
                subject: template.subject,
                body_html: template.body_html,
                body_text: template.body_text
            }));
        }
    };

    const handleSend = async () => {
        if (!formData.to.length || !formData.subject || !formData.body_html) {
            alert('Please fill in all required fields');
            return;
        }

        setIsLoading(true);
        
        try {
            const response = await fetch('/emails/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                router.visit('/emails', {
                    onSuccess: () => {
                        // Show success message
                    }
                });
            } else {
                const error = await response.json();
                alert('Error sending email: ' + (error.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error sending email:', error);
            alert('Error sending email');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveDraft = async () => {
        // Implement save draft functionality
        console.log('Save draft:', formData);
    };

    return (
        <AppLayout
            user={user}
            breadcrumbs={breadcrumbs}
            notificationCount={5}
            messageCount={3}
        >
            <Head title="Compose Email" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-gray-50">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Compose Email</h1>
                        <p className="text-gray-600">Send a new email message</p>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" onClick={handleSaveDraft}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Draft
                        </Button>
                        <Button onClick={() => router.visit('/emails')} variant="outline">
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                    </div>
                </div>

                {/* Compose Form */}
                <Card className="flex-1">
                    <CardHeader>
                        <CardTitle>New Message</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Template Selection */}
                        {templates.length > 0 && (
                            <div className="space-y-2">
                                <Label htmlFor="template">Email Template (Optional)</Label>
                                <Select value={formData.template_id} onValueChange={handleTemplateSelect}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a template..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {templates.map((template) => (
                                            <SelectItem key={template.id} value={template.id.toString()}>
                                                <div className="flex items-center space-x-2">
                                                    <FileText className="h-4 w-4" />
                                                    <span>{template.name}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* To Field */}
                        <div className="space-y-2">
                            <Label htmlFor="to">To *</Label>
                            <div className="space-y-2">
                                <div className="flex flex-wrap gap-2">
                                    {formData.to.map((email) => (
                                        <Badge key={email} variant="secondary" className="flex items-center space-x-1">
                                            <span>{email}</span>
                                            <button
                                                onClick={() => handleRemoveRecipient('to', email)}
                                                className="ml-1 hover:text-red-500"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex space-x-2">
                                    <Input
                                        type="email"
                                        placeholder="Enter email address..."
                                        value={toInput}
                                        onChange={(e) => setToInput(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddRecipient('to', toInput);
                                            }
                                        }}
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleAddRecipient('to', toInput)}
                                        disabled={!toInput}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* CC/BCC Toggle */}
                        <div className="flex space-x-4">
                            {!showCc && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowCc(true)}
                                >
                                    Add CC
                                </Button>
                            )}
                            {!showBcc && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowBcc(true)}
                                >
                                    Add BCC
                                </Button>
                            )}
                        </div>

                        {/* CC Field */}
                        {showCc && (
                            <div className="space-y-2">
                                <Label htmlFor="cc">CC</Label>
                                <div className="space-y-2">
                                    <div className="flex flex-wrap gap-2">
                                        {formData.cc.map((email) => (
                                            <Badge key={email} variant="secondary" className="flex items-center space-x-1">
                                                <span>{email}</span>
                                                <button
                                                    onClick={() => handleRemoveRecipient('cc', email)}
                                                    className="ml-1 hover:text-red-500"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="flex space-x-2">
                                        <Input
                                            type="email"
                                            placeholder="Enter CC email address..."
                                            value={ccInput}
                                            onChange={(e) => setCcInput(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddRecipient('cc', ccInput);
                                                }
                                            }}
                                            className="flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleAddRecipient('cc', ccInput)}
                                            disabled={!ccInput}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* BCC Field */}
                        {showBcc && (
                            <div className="space-y-2">
                                <Label htmlFor="bcc">BCC</Label>
                                <div className="space-y-2">
                                    <div className="flex flex-wrap gap-2">
                                        {formData.bcc.map((email) => (
                                            <Badge key={email} variant="secondary" className="flex items-center space-x-1">
                                                <span>{email}</span>
                                                <button
                                                    onClick={() => handleRemoveRecipient('bcc', email)}
                                                    className="ml-1 hover:text-red-500"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="flex space-x-2">
                                        <Input
                                            type="email"
                                            placeholder="Enter BCC email address..."
                                            value={bccInput}
                                            onChange={(e) => setBccInput(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddRecipient('bcc', bccInput);
                                                }
                                            }}
                                            className="flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleAddRecipient('bcc', bccInput)}
                                            disabled={!bccInput}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Subject */}
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject *</Label>
                            <Input
                                id="subject"
                                type="text"
                                placeholder="Enter email subject..."
                                value={formData.subject}
                                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                                required
                            />
                        </div>

                        {/* Message Body */}
                        <div className="space-y-2">
                            <Label htmlFor="body">Message *</Label>
                            <Textarea
                                id="body"
                                placeholder="Type your message here..."
                                value={formData.body_html}
                                onChange={(e) => setFormData(prev => ({ 
                                    ...prev, 
                                    body_html: e.target.value,
                                    body_text: e.target.value // Simple fallback
                                }))}
                                rows={12}
                                required
                            />
                        </div>

                        {/* Schedule Send */}
                        <div className="space-y-2">
                            <Label htmlFor="send_at">Schedule Send (Optional)</Label>
                            <Input
                                id="send_at"
                                type="datetime-local"
                                value={formData.send_at}
                                onChange={(e) => setFormData(prev => ({ ...prev, send_at: e.target.value }))}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between pt-6">
                            <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                    <Paperclip className="h-4 w-4 mr-2" />
                                    Attach Files
                                </Button>
                            </div>
                            <div className="flex space-x-2">
                                <Button variant="outline" onClick={handleSaveDraft}>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Draft
                                </Button>
                                <Button onClick={handleSend} disabled={isLoading}>
                                    {formData.send_at ? (
                                        <>
                                            <Clock className="h-4 w-4 mr-2" />
                                            Schedule Send
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            Send Now
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
