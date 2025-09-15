import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TestLogin() {
    const [email, setEmail] = useState('isaacmuchunu@gmail.com');
    const [password, setPassword] = useState('Kukus@1993');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleTestLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch('/test-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            setResult(data);

            if (data.success) {
                // Redirect to appropriate dashboard
                window.location.href = data.redirect;
            }
        } catch (error) {
            setResult({ success: false, message: 'Network error: ' + error });
        } finally {
            setLoading(false);
        }
    };

    const handleTestAuth = async () => {
        try {
            const response = await fetch('/test-auth');
            const data = await response.json();
            setResult(data);
        } catch (error) {
            setResult({ error: 'Network error: ' + error });
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <Head title="Test Login" />
            <div className="max-w-md w-full space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Test Login System</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleTestLogin} className="space-y-4">
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Testing...' : 'Test Login'}
                            </Button>
                        </form>

                        <Button 
                            variant="outline" 
                            className="w-full" 
                            onClick={handleTestAuth}
                        >
                            Test User Credentials
                        </Button>

                        {result && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-medium mb-2">Result:</h3>
                                <pre className="text-sm overflow-auto">
                                    {JSON.stringify(result, null, 2)}
                                </pre>
                            </div>
                        )}

                        <div className="text-center space-y-2">
                            <p className="text-sm text-gray-600">Test with admin credentials:</p>
                            <p className="text-xs font-mono">isaacmuchunu@gmail.com</p>
                            <p className="text-xs font-mono">Kukus@1993</p>
                        </div>

                        <div className="text-center">
                            <a href="/login" className="text-blue-600 hover:underline">
                                Go to actual login page
                            </a>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
