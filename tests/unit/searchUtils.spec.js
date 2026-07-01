import { normalizeForSearch, matchesSearch } from '@/shared/utils/searchUtils'

describe('searchUtils', () => {
  describe('normalizeForSearch', () => {
    it('should remove accents from Spanish characters', () => {
      expect(normalizeForSearch('Métrica')).toBe('metrica')
      expect(normalizeForSearch('Niño')).toBe('nino')
      expect(normalizeForSearch('Café')).toBe('cafe')
      expect(normalizeForSearch('Árbol')).toBe('arbol')
      expect(normalizeForSearch('José')).toBe('jose')
    })

    it('should convert to lowercase', () => {
      expect(normalizeForSearch('HELLO')).toBe('hello')
      expect(normalizeForSearch('World')).toBe('world')
      expect(normalizeForSearch('MÉTRICA')).toBe('metrica')
    })

    it('should remove spaces', () => {
      expect(normalizeForSearch('MARC STUDY')).toBe('marcstudy')
      expect(normalizeForSearch('hello world')).toBe('helloworld')
      expect(normalizeForSearch('test  with   spaces')).toBe('testwithspaces')
    })

    it('should remove special characters', () => {
      expect(normalizeForSearch('eye-tracking-test')).toBe('eyetrackingtest')
      expect(normalizeForSearch('hello_world')).toBe('helloworld')
      expect(normalizeForSearch('test.file.name')).toBe('testfilename')
      expect(normalizeForSearch('user@email.com')).toBe('useremailcom')
    })

    it('should remove spaces, accents and convert to lowercase', () => {
      expect(normalizeForSearch('Café con Leche')).toBe('cafeconleche')
      expect(normalizeForSearch('MÉTRICA DE USABILIDAD')).toBe('metricadeusabilidad')
    })

    it('should handle empty or null values', () => {
      expect(normalizeForSearch('')).toBe('')
      expect(normalizeForSearch(null)).toBe('')
      expect(normalizeForSearch(undefined)).toBe('')
    })

    it('should handle text without accents or spaces', () => {
      expect(normalizeForSearch('hello')).toBe('hello')
      expect(normalizeForSearch('test123')).toBe('test123')
    })
  })

  describe('matchesSearch', () => {
    it('should match text with accents to query without accents', () => {
      expect(matchesSearch('Métrica de usabilidad', 'metrica')).toBe(true)
      expect(matchesSearch('Café con leche', 'cafe')).toBe(true)
      expect(matchesSearch('Niño pequeño', 'nino')).toBe(true)
    })

    it('should match text without accents to query with accents', () => {
      expect(matchesSearch('metrica de usabilidad', 'métrica')).toBe(true)
      expect(matchesSearch('cafe con leche', 'café')).toBe(true)
    })

    it('should match text with spaces to query without spaces', () => {
      expect(matchesSearch('MARC STUDY', 'marcstudy')).toBe(true)
      expect(matchesSearch('Hello World', 'helloworld')).toBe(true)
      expect(matchesSearch('User Test Template', 'usertest')).toBe(true)
    })

    it('should match text without spaces to query with spaces', () => {
      expect(matchesSearch('marcstudy', 'marc study')).toBe(true)
      expect(matchesSearch('helloworld', 'hello world')).toBe(true)
    })

    it('should match text with hyphens to query without hyphens', () => {
      expect(matchesSearch('eye-tracking-test', 'eyetracking')).toBe(true)
      expect(matchesSearch('user-test-template', 'usertest')).toBe(true)
      expect(matchesSearch('hello-world', 'helloworld')).toBe(true)
    })

    it('should match text with special characters to query without them', () => {
      expect(matchesSearch('test_file.name', 'testfile')).toBe(true)
      expect(matchesSearch('user@email.com', 'useremail')).toBe(true)
    })

    it('should be case insensitive', () => {
      expect(matchesSearch('Hello World', 'hello')).toBe(true)
      expect(matchesSearch('hello world', 'HELLO')).toBe(true)
      expect(matchesSearch('Métrica', 'METRICA')).toBe(true)
    })

    it('should return true for empty query', () => {
      expect(matchesSearch('any text', '')).toBe(true)
      expect(matchesSearch('any text', null)).toBe(true)
      expect(matchesSearch('any text', undefined)).toBe(true)
    })

    it('should return false for empty text with non-empty query', () => {
      expect(matchesSearch('', 'query')).toBe(false)
      expect(matchesSearch(null, 'query')).toBe(false)
      expect(matchesSearch(undefined, 'query')).toBe(false)
    })

    it('should handle partial matches', () => {
      expect(matchesSearch('Evaluación heurística', 'heur')).toBe(true)
      expect(matchesSearch('Template de accesibilidad', 'template')).toBe(true)
      expect(matchesSearch('MARC STUDY TEST', 'marcstudy')).toBe(true)
    })

    it('should return false when no match', () => {
      expect(matchesSearch('Hello World', 'xyz')).toBe(false)
      expect(matchesSearch('Métrica', 'test')).toBe(false)
    })
  })
})
