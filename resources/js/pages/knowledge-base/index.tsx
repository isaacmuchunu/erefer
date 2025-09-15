import AppLayout from '@/layouts/AppLayout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Knowledge Base' },
];

import { Book, Search, FileText, ArrowRight } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function KnowledgeBaseIndex({ auth, categories = [], popularArticles = [] }: PageProps<{ categories?: string[], popularArticles?: any[] }>) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredArticles = popularArticles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout user={auth.user} breadcrumbs={breadcrumbs}>
      <Head title="Knowledge Base" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Book className="w-8 h-8" />
              Knowledge Base
            </h1>
            <p className="text-muted-foreground">Find articles, guides, and other resources.</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Categories
            </h2>
            <div className="space-y-2">
              {categories.map((category, index) => (
                <Link
                  key={index}
                  href={`/knowledge-base/${category.toLowerCase().replace(' ', '-')}`}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <span>{category}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Popular Articles
            </h2>
            <div className="space-y-2">
              {filteredArticles.map((article, index) => (
                <Link
                  key={index}
                  href={`/knowledge-base/${article.title.toLowerCase().replace(' ', '-')}`}
                  className="block p-3 bg-white rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span>{article.title}</span>
                    <span className="text-sm text-gray-500">{article.views} views</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}