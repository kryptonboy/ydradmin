import { mount, type VueWrapper } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, provide, ref } from 'vue'
import { createBlock } from '@/helpers/content-blocks'
import type { EditorBlock } from '@/types/content-blocks'
import BlockEditor from '../BlockEditor.vue'
import { blockErrorsKey } from '../injection'

const mounted: VueWrapper[] = []

/** Hôte qui porte l'état (v-model) et fournit les erreurs d'API, comme la page d'édition. */
function mountEditor(initial: EditorBlock[], errors: Record<string, string> = {}) {
  const blocks = ref(initial)
  const Host = defineComponent({
    setup() {
      provide(blockErrorsKey, ref(errors))
      return () =>
        h(BlockEditor, {
          modelValue: blocks.value,
          'onUpdate:modelValue': (value: EditorBlock[]) => (blocks.value = value),
          path: 'blocks',
        })
    },
  })
  const wrapper = mount(Host, {
    attachTo: document.body,
    global: { plugins: [createPinia()], stubs: { FontAwesomeIcon: true } },
  })
  mounted.push(wrapper)
  return { wrapper, blocks }
}

afterEach(() => {
  mounted.splice(0).forEach((w) => w.unmount())
  document.body.innerHTML = ''
})

describe('BlockEditor', () => {
  it('propose les 12 types de blocs', () => {
    const { wrapper } = mountEditor([])
    expect(wrapper.findAll('.dropdown-item')).toHaveLength(12)
  })

  it('ajoute un bloc du type choisi', async () => {
    const { wrapper, blocks } = mountEditor([])
    const video = wrapper.findAll('.dropdown-item').find((b) => b.text() === 'Vidéo')
    await video?.trigger('click')

    expect(blocks.value.map((b) => b.type)).toEqual(['video'])
    expect(wrapper.find('input[type="url"]').exists()).toBe(true)
  })

  it('modifie le bloc et supprime à la demande', async () => {
    const video = createBlock('video')
    const { wrapper, blocks } = mountEditor([video, createBlock('map')])

    await wrapper.find('input[type="url"]').setValue('https://example.com/v')
    expect(blocks.value[0]).toMatchObject({ type: 'video', url: 'https://example.com/v' })

    await wrapper.find('button[aria-label="Supprimer le bloc"]').trigger('click')
    expect(blocks.value.map((b) => b.type)).toEqual(['map'])
  })

  it('déplace un bloc avec les boutons', async () => {
    const { wrapper, blocks } = mountEditor([createBlock('video'), createBlock('map')])
    await wrapper.findAll('button[aria-label="Descendre le bloc"]')[0].trigger('click')
    expect(blocks.value.map((b) => b.type)).toEqual(['map', 'video'])
  })

  it('affiche les erreurs 422 sur le bloc fautif seulement', () => {
    const { wrapper } = mountEditor([createBlock('video'), createBlock('map')], {
      'blocks[1].latitude': 'Valeur invalide',
    })
    const cards = wrapper.findAll('.block-item')
    expect(cards[0].classes()).not.toContain('border-danger')
    expect(cards[1].classes()).toContain('border-danger')
    expect(cards[1].text()).toContain('Valeur invalide')
  })

  it('affiche une erreur imbriquée dans le bloc enfant, pas dans le parent', () => {
    const section = createBlock('section')
    if (section.type !== 'section') throw new Error('type inattendu')
    section.children = [createBlock('video')]
    const { wrapper } = mountEditor([section], {
      'blocks[0].children[0].url': 'Adresse invalide',
    })

    const cards = wrapper.findAll('.block-item')
    expect(cards).toHaveLength(2)
    // le parent est signalé, mais le message n'est affiché que dans l'enfant
    expect(cards[0].classes()).toContain('border-danger')
    expect(wrapper.findAll('ul.text-danger')).toHaveLength(1)
    expect(cards[1].find('ul.text-danger').text()).toContain('Adresse invalide')
  })
})
