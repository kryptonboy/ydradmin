import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import GradingCompanyView from '../GradingCompanyView.vue'
import GradingCompanyModal from '../modals/GradingCompanyModal.vue'

const mounted: VueWrapper[] = []

function mockFetch(body: unknown = { member: [] }, status = 200) {
  const fn = vi
    .fn()
    .mockImplementation(() => Promise.resolve(new Response(JSON.stringify(body), { status })))
  vi.stubGlobal('fetch', fn)
  return fn
}

function mountComponent(component: object, props: Record<string, unknown> = {}) {
  const wrapper = mount(component, {
    props,
    attachTo: document.body,
    global: { plugins: [createPinia()], stubs: { FontAwesomeIcon: true } },
  })
  mounted.push(wrapper)
  return wrapper
}

const settle = async () => {
  await flushPromises()
  await new Promise((resolve) => setTimeout(resolve, 50))
  await flushPromises()
}

const writes = (fetchMock: ReturnType<typeof mockFetch>, method: string) =>
  fetchMock.mock.calls.filter(([, init]) => init?.method === method)

beforeEach(() => {
  vi.stubGlobal('bootstrap', {
    Modal: class {
      show = vi.fn()
      hide = vi.fn()
    },
  })
})

afterEach(() => {
  mounted.splice(0).forEach((w) => w.unmount())
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

const company = { '@id': '/api/grading_companies/2', id: 2, name: 'PSA' }

describe('GradingCompanyModal', () => {
  it('exige un nom', async () => {
    const fetchMock = mockFetch({})
    const wrapper = mountComponent(GradingCompanyModal)
    await settle()

    await wrapper.find('form').trigger('submit')
    await settle()

    expect(wrapper.text()).toContain('Nom requis')
    expect(writes(fetchMock, 'POST')).toHaveLength(0)
  })

  it('crée une société', async () => {
    const fetchMock = mockFetch({})
    const wrapper = mountComponent(GradingCompanyModal)
    await settle()

    await wrapper.find('#gradingCompanyModal-name').setValue('BGS')
    await wrapper.find('form').trigger('submit')
    await settle()

    const call = writes(fetchMock, 'POST')[0]
    expect(String(call[0])).toMatch(/\/grading_companies$/)
    expect(JSON.parse(call[1].body)).toEqual({ name: 'BGS' })
  })

  it('renomme une société', async () => {
    const fetchMock = mockFetch({})
    const wrapper = mountComponent(GradingCompanyModal, { gradingCompany: company })
    await settle()

    await wrapper.find('#gradingCompanyModal-name').setValue('PSA Grading')
    await wrapper.find('form').trigger('submit')
    await settle()

    const call = writes(fetchMock, 'PATCH')[0]
    expect(String(call[0])).toMatch(/\/grading_companies\/2$/)
    expect(JSON.parse(call[1].body)).toMatchObject({ name: 'PSA Grading' })
  })
})

describe('GradingCompanyView', () => {
  it('liste les sociétés et supprime après confirmation', async () => {
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))
    const fetchMock = mockFetch({ member: [company], totalItems: 1 })
    const wrapper = mountComponent(GradingCompanyView)
    await settle()

    expect(wrapper.text()).toContain('PSA')
    await wrapper.find('button[aria-label="Supprimer"]').trigger('click')
    await settle()

    expect(String(writes(fetchMock, 'DELETE')[0][0])).toMatch(/\/grading_companies\/2$/)
  })
})
