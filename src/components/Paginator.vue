<script setup lang="ts">
import type { Pagination } from '@/types/states/Pagination'
import { computed } from 'vue'

const emit = defineEmits(['pageChanged'])

const props = defineProps<{
  pagination: Pagination
  currentPage: number
}>()

const changePage = (numPage: number) => {
  emit('pageChanged', numPage)
}

type PageItem = {
  text: string
  pageNumber: number | null
  isCurrent: boolean
  isEllipsis?: boolean
}

function buildPagination(
  currentPage: number,
  totalItems: number,
  perPage: number = 50,
): PageItem[] {
  const nbPages: number = Math.ceil(totalItems / perPage)
  if (nbPages === 1) return []

  const visibleRange: number = 2
  const pages: PageItem[] = []
  const minPage: number = Math.max(2, currentPage - visibleRange)
  const maxPage: number = Math.min(currentPage + visibleRange, nbPages - 1)

  if (currentPage > 1) {
    pages.push({ text: '<<', pageNumber: 1, isCurrent: false })
    pages.push({ text: '<', pageNumber: currentPage - 1, isCurrent: false })
  }

  pages.push({ text: '1', pageNumber: 1, isCurrent: currentPage === 1 })

  if (minPage > 2) {
    pages.push({ text: '...', pageNumber: null, isCurrent: false, isEllipsis: true })
  }

  for (let i = minPage; i <= maxPage; i++) {
    pages.push({ text: i.toString(), pageNumber: i, isCurrent: i === currentPage })
  }

  if (maxPage < nbPages - 1) {
    pages.push({ text: '...', pageNumber: null, isCurrent: false, isEllipsis: true })
  }

  if (nbPages > 1) {
    pages.push({
      text: nbPages.toString(),
      pageNumber: nbPages,
      isCurrent: nbPages === currentPage,
    })
  }

  if (currentPage < nbPages) {
    pages.push({ text: '>', pageNumber: currentPage + 1, isCurrent: false })
    pages.push({ text: '>>', pageNumber: nbPages, isCurrent: false })
  }

  return pages
}

const paginationArray = computed(() =>
  buildPagination(props.currentPage, props.pagination.totalItems),
)
</script>

<template>
  <nav aria-label="Pagination">
    <ul class="pagination justify-content-center" v-if="paginationArray.length">
      <li v-for="page of paginationArray" class="page-item" :key="page.text">
        <span v-if="page.isEllipsis" class="page-link disabled">{{ page.text }}</span>
        <a
          class="page-link"
          @click="changePage(page.pageNumber)"
          v-else-if="!page.isCurrent"
          role="button"
          >{{ page.text }}</a
        >
        <p class="page-link active" v-else>
          <strong>{{ page.text }}</strong>
        </p>
      </li>
    </ul>
  </nav>
</template>
