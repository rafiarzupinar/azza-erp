'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { EditCompanyDialog } from '@/components/edit-company-dialog'
import { Edit, Trash2, Loader2 } from 'lucide-react'
import type { Company } from '@/types/database'

interface CompanyActionsProps {
  company: Company
}

export function CompanyActions({ company }: CompanyActionsProps) {
  const [deleting, setDeleting] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm(`${company.name} şirketini silmek istediğinizden emin misiniz?`)) {
      return
    }

    setDeleting(true)

    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', company.id)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error('Hata:', error)
      alert('Şirket silinirken hata oluştu!')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleDelete}
          disabled={deleting}
          className="text-red-600 hover:bg-red-50"
        >
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
      </div>

      <EditCompanyDialog
        company={company}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  )
}
