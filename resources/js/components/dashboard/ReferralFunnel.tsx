import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, FunnelChart, Funnel, Tooltip, LabelList } from 'recharts';

interface FunnelData {
    name: string;
    value: number;
    fill: string;
}

const data: FunnelData[] = [
    { name: 'Total Referrals', value: 500, fill: '#8884d8' },
    { name: 'Pending', value: 400, fill: '#83a6ed' },
    { name: 'In Progress', value: 300, fill: '#8dd1e1' },
    { name: 'Completed', value: 200, fill: '#82ca9d' },
    { name: 'Cancelled', value: 100, fill: '#a4de6c' },
];

export function ReferralFunnel() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Referral Funnel</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <FunnelChart>
                        <Tooltip />
                        <Funnel dataKey="value" data={data} isAnimationActive>
                            <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
                        </Funnel>
                    </FunnelChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}