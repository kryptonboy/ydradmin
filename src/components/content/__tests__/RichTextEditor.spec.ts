import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import RichTextEditor from '../RichTextEditor.vue'

const mounted: VueWrapper[] = []

function mountEditor(props: { modelValue: string; variant?: 'minimal' | 'rich' | 'table' }) {
  const wrapper = mount(RichTextEditor, {
    props,
    attachTo: document.body,
    global: { stubs: { FontAwesomeIcon: true } },
  })
  mounted.push(wrapper)
  return wrapper
}

afterEach(() => {
  mounted.splice(0).forEach((w) => w.unmount())
  document.body.innerHTML = ''
})

describe('RichTextEditor', () => {
  it.each(['minimal', 'rich', 'table'] as const)('se monte en variante « %s »', async (variant) => {
    const wrapper = mountEditor({ modelValue: '<p>Bonjour</p>', variant })
    await flushPromises()

    expect(wrapper.find('[role="textbox"]').text()).toContain('Bonjour')
    expect(wrapper.find('[role="toolbar"]').exists()).toBe(true)
  })

  it('propose les listes et titres hors variante minimale', async () => {
    const minimal = mountEditor({ modelValue: '', variant: 'minimal' })
    const rich = mountEditor({ modelValue: '', variant: 'rich' })
    await flushPromises()

    expect(minimal.find('button[aria-label="Liste à puces"]').exists()).toBe(false)
    expect(rich.find('button[aria-label="Liste à puces"]').exists()).toBe(true)
  })

  it("ajoute les commandes de tableau uniquement pour la variante 'table'", async () => {
    const rich = mountEditor({ modelValue: '', variant: 'rich' })
    const table = mountEditor({ modelValue: '', variant: 'table' })
    await flushPromises()

    expect(rich.find('button[aria-label="Insérer un tableau"]').exists()).toBe(false)
    expect(table.find('button[aria-label="Insérer un tableau"]').exists()).toBe(true)
  })

  it('reflète une modification externe de la valeur', async () => {
    const wrapper = mountEditor({ modelValue: '<p>Avant</p>' })
    await flushPromises()

    await wrapper.setProps({ modelValue: '<p>Après</p>' })
    await flushPromises()

    expect(wrapper.find('[role="textbox"]').text()).toContain('Après')
  })

  it("rend un tableau avec l'extension dédiée", async () => {
    const wrapper = mountEditor({
      modelValue: '<table><tbody><tr><td>A1</td><td>B1</td></tr></tbody></table>',
      variant: 'table',
    })
    await flushPromises()

    expect(wrapper.findAll('td')).toHaveLength(2)
  })
})
