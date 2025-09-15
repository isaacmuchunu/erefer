import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Book } from 'lucide-react';

export default function KnowledgeBase() {
  const faqs = [
    {
      question: 'How do I create a referral?',
      answer: 'To create a referral, navigate to the Referrals section, click on Create, and fill in the patient and referral details.',
    },
    {
      question: 'How can I check bed availability?',
      answer: 'Go to the Beds section to view and manage bed availability across facilities.',
    },
    // Add more FAQs as needed
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Knowledge Base</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Book className="mr-2" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6">
            <li><a href="#" className="text-blue-500 hover:underline">User Guide PDF</a></li>
            <li><a href="#" className="text-blue-500 hover:underline">Video Tutorials</a></li>
            <li><a href="#" className="text-blue-500 hover:underline">Contact Support</a></li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}