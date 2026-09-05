import { DOCUMENT_CATEGORIES, DOCUMENT_CATEGORY_LABELS, type Locale, type DocumentCategory } from "@/lib/constants";
import Disclosure from "@/components/Disclosure";
import { uploadDocumentAction, deleteDocumentAction } from "@/lib/actions/documents";
import { FileText, Trash2, Download } from "lucide-react";
import type { Document, User } from "@prisma/client";

export default function DocumentsTab({ projectId, documents, locale, canEdit }: { projectId: string; documents: (Document & { uploadedBy: User | null })[]; locale: Locale; canEdit: boolean }) {
  const grouped = DOCUMENT_CATEGORIES.map((cat) => ({ cat, docs: documents.filter((d) => d.category === cat) })).filter((g) => g.docs.length > 0);

  return (
    <div className="space-y-4">
      {canEdit && (
        <Disclosure label="Завантажити файл">
          <form action={uploadDocumentAction.bind(null, projectId)} className="flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-gray-500">Категорія</span>
              <select name="category" className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" defaultValue="OTHER">
                {DOCUMENT_CATEGORIES.map((c) => <option key={c} value={c}>{DOCUMENT_CATEGORY_LABELS[c][locale]}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-gray-500">Файл</span>
              <input type="file" name="file" required className="text-sm text-gray-600 dark:text-gray-300" />
            </label>
            <button type="submit" className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">Завантажити</button>
          </form>
        </Disclosure>
      )}

      {grouped.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-300 py-10 text-center text-sm text-gray-400 dark:border-gray-700">Документів ще немає</p>
      ) : (
        <div className="space-y-4">
          {grouped.map(({ cat, docs }) => (
            <div key={cat}>
              <h3 className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">{DOCUMENT_CATEGORY_LABELS[cat as DocumentCategory][locale]}</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {docs.map((d) => (
                  <div key={d.id} className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white p-3 text-sm dark:border-gray-800 dark:bg-gray-900">
                    <a href={d.url} target="_blank" rel="noopener noreferrer" className="flex min-w-0 items-center gap-2 text-gray-700 hover:text-orange-600 dark:text-gray-300">
                      <FileText size={16} className="shrink-0 text-gray-400" />
                      <span className="min-w-0 truncate">{d.name}</span>
                    </a>
                    <div className="flex shrink-0 items-center gap-2">
                      <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-gray-600">
                        <Download size={14} />
                      </a>
                      {canEdit && (
                        <form action={deleteDocumentAction.bind(null, d.id, projectId)}>
                          <button className="text-gray-300 hover:text-rose-500"><Trash2 size={14} /></button>
                        </form>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
