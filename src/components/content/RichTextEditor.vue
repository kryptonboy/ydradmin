<script setup lang="ts">
import StarterKit from '@tiptap/starter-kit'
import { TableKit } from '@tiptap/extension-table'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { onBeforeUnmount, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    /** `minimal` : texte en ligne ; `rich` : titres, listes, citations ; `table` : tableaux */
    variant?: 'minimal' | 'rich' | 'table'
    /** Identifiant du champ éditable (pour le label) */
    id?: string
    invalid?: boolean
  }>(),
  { variant: 'rich', id: undefined, invalid: false },
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const isRich = props.variant !== 'minimal'

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      heading: isRich ? { levels: [2, 3, 4] } : false,
      bulletList: isRich ? undefined : false,
      orderedList: isRich ? undefined : false,
      listItem: isRich ? undefined : false,
      blockquote: isRich ? undefined : false,
      codeBlock: false,
      code: false,
      horizontalRule: false,
      link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
    }),
    ...(props.variant === 'table' ? [TableKit] : []),
  ],
  editorProps: {
    attributes: {
      id: props.id ?? '',
      class: 'form-control rich-text-content',
      role: 'textbox',
      'aria-multiline': 'true',
    },
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.isEmpty ? '' : editor.getHTML())
  },
})

watch(
  () => props.modelValue,
  (value) => {
    const current = editor.value
    if (!current) return
    const html = current.isEmpty ? '' : current.getHTML()
    if (value !== html) current.commands.setContent(value, { emitUpdate: false })
  },
)

onBeforeUnmount(() => editor.value?.destroy())

function setLink() {
  const current = editor.value
  if (!current) return
  const previous = current.getAttributes('link').href as string | undefined
  const url = window.prompt("Adresse du lien (laisser vide pour retirer l'adresse)", previous ?? '')
  if (url === null) return
  if (url === '') {
    current.chain().focus().extendMarkRange('link').unsetLink().run()
  } else {
    current.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }
}
</script>

<template>
  <div class="rich-text" :class="{ 'is-invalid': invalid }">
    <div
      v-if="editor"
      class="btn-toolbar gap-1 mb-1"
      role="toolbar"
      aria-label="Mise en forme du texte"
    >
      <div class="btn-group btn-group-sm" role="group">
        <button
          type="button"
          class="btn btn-outline-secondary"
          :class="{ active: editor.isActive('bold') }"
          :aria-pressed="editor.isActive('bold')"
          aria-label="Gras"
          title="Gras"
          @click="editor.chain().focus().toggleBold().run()"
        >
          <font-awesome-icon :icon="['fa', 'bold']" />
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary"
          :class="{ active: editor.isActive('italic') }"
          :aria-pressed="editor.isActive('italic')"
          aria-label="Italique"
          title="Italique"
          @click="editor.chain().focus().toggleItalic().run()"
        >
          <font-awesome-icon :icon="['fa', 'italic']" />
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary"
          :class="{ active: editor.isActive('underline') }"
          :aria-pressed="editor.isActive('underline')"
          aria-label="Souligné"
          title="Souligné"
          @click="editor.chain().focus().toggleUnderline().run()"
        >
          <font-awesome-icon :icon="['fa', 'underline']" />
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary"
          :class="{ active: editor.isActive('strike') }"
          :aria-pressed="editor.isActive('strike')"
          aria-label="Barré"
          title="Barré"
          @click="editor.chain().focus().toggleStrike().run()"
        >
          <font-awesome-icon :icon="['fa', 'strikethrough']" />
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary"
          :class="{ active: editor.isActive('link') }"
          :aria-pressed="editor.isActive('link')"
          aria-label="Lien"
          title="Lien"
          @click="setLink"
        >
          <font-awesome-icon :icon="['fa', 'link']" />
        </button>
      </div>

      <div v-if="isRich" class="btn-group btn-group-sm" role="group">
        <button
          type="button"
          class="btn btn-outline-secondary"
          :class="{ active: editor.isActive('heading', { level: 2 }) }"
          :aria-pressed="editor.isActive('heading', { level: 2 })"
          aria-label="Titre"
          title="Titre"
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        >
          <font-awesome-icon :icon="['fa', 'heading']" />
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary"
          :class="{ active: editor.isActive('bulletList') }"
          :aria-pressed="editor.isActive('bulletList')"
          aria-label="Liste à puces"
          title="Liste à puces"
          @click="editor.chain().focus().toggleBulletList().run()"
        >
          <font-awesome-icon :icon="['fa', 'list-ul']" />
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary"
          :class="{ active: editor.isActive('orderedList') }"
          :aria-pressed="editor.isActive('orderedList')"
          aria-label="Liste numérotée"
          title="Liste numérotée"
          @click="editor.chain().focus().toggleOrderedList().run()"
        >
          <font-awesome-icon :icon="['fa', 'list-ol']" />
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary"
          :class="{ active: editor.isActive('blockquote') }"
          :aria-pressed="editor.isActive('blockquote')"
          aria-label="Citation"
          title="Citation"
          @click="editor.chain().focus().toggleBlockquote().run()"
        >
          <font-awesome-icon :icon="['fa', 'quote-left']" />
        </button>
      </div>

      <div v-if="variant === 'table'" class="btn-group btn-group-sm" role="group">
        <button
          type="button"
          class="btn btn-outline-secondary"
          aria-label="Insérer un tableau"
          title="Insérer un tableau"
          @click="
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          "
        >
          <font-awesome-icon :icon="['fa', 'table']" />
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary"
          :disabled="!editor.can().addRowAfter()"
          @click="editor.chain().focus().addRowAfter().run()"
        >
          + ligne
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary"
          :disabled="!editor.can().deleteRow()"
          @click="editor.chain().focus().deleteRow().run()"
        >
          − ligne
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary"
          :disabled="!editor.can().addColumnAfter()"
          @click="editor.chain().focus().addColumnAfter().run()"
        >
          + colonne
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary"
          :disabled="!editor.can().deleteColumn()"
          @click="editor.chain().focus().deleteColumn().run()"
        >
          − colonne
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary"
          :disabled="!editor.can().deleteTable()"
          @click="editor.chain().focus().deleteTable().run()"
        >
          Supprimer
        </button>
      </div>

      <div class="btn-group btn-group-sm" role="group">
        <button
          type="button"
          class="btn btn-outline-secondary"
          :disabled="!editor.can().undo()"
          aria-label="Annuler"
          title="Annuler"
          @click="editor.chain().focus().undo().run()"
        >
          <font-awesome-icon :icon="['fa', 'rotate-left']" />
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary"
          :disabled="!editor.can().redo()"
          aria-label="Rétablir"
          title="Rétablir"
          @click="editor.chain().focus().redo().run()"
        >
          <font-awesome-icon :icon="['fa', 'rotate-right']" />
        </button>
      </div>
    </div>
    <EditorContent :editor="editor" />
  </div>
</template>

<style>
.rich-text .rich-text-content {
  min-height: 6rem;
  height: auto;
  overflow-wrap: anywhere;
}
.rich-text .rich-text-content:focus {
  outline: 0;
}
.rich-text.is-invalid .rich-text-content {
  border-color: var(--bs-form-invalid-border-color);
}
.rich-text table {
  border-collapse: collapse;
  width: 100%;
}
.rich-text th,
.rich-text td {
  border: 1px solid var(--bs-border-color);
  padding: 0.25rem 0.5rem;
  min-width: 3rem;
}
.rich-text .selectedCell {
  background: var(--bs-primary-bg-subtle);
}
</style>
