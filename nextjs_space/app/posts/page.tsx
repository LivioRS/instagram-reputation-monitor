import { Suspense } from 'react'
import PostsContent from '@/components/posts/posts-content'
import { Skeleton } from '@/components/ui/skeleton'

export default function PostsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Posts Analisados</h1>
        <p className="text-slate-600 mt-2">Todos os posts coletados e analisados do Instagram</p>
      </div>
      
      <Suspense fallback={<PostsSkeleton />}>
        <PostsContent />
      </Suspense>
    </div>
  )
}

function PostsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
      </div>
      <Skeleton className="h-96" />
    </div>
  )
}
