import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

/**
 * Composable for generating filter definitions from test structure and answers
 * @param {Object} params
 * @param {ComputedRef} params.testStructure - Test structure computed ref
 * @param {ComputedRef} params.answers - Answers computed ref
 * @param {string} params.ALL_VALUE - Value used for "All" option (default: '__ALL__')
 * @returns {Object} Filter definitions and utilities
 */
export function useFilterDefinitions({ testStructure, answers, ALL_VALUE = '__ALL__' }) {
  const { t } = useI18n();

  const filterDefinitions = computed(() => {
    const pre = testStructure.value?.preTest || [];
    return pre.map((q, idx) => {
      // valores desde respuestas reales
      const answerValueSet = new Set();
      Object.values(answers.value).forEach(s => {
        const a = s.preTestAnswer?.[idx]?.answer;
        if (a !== undefined && a !== null && a !== '') answerValueSet.add(a);
      });

      // valores declarados en la estructura (selectionFields) si es tipo selección
      if (q?.type === 'selection' && Array.isArray(q.selectionFields)) {
        q.selectionFields.forEach(opt => {
          if (opt !== undefined && opt !== null && opt !== '') answerValueSet.add(opt);
        });
      }

      const options = Array.from(answerValueSet).sort();

      // Forzar dropdown si es pregunta de selección aunque solo haya 1 opción todavía
      const isSelection = q?.type === 'selection';
      const isCategoricalByCount = options.length >= 2 && options.length <= 50;
      const isCategorical = isSelection || isCategoricalByCount;

      const baseItems = isCategorical ? options.map(o => ({ title: o, value: o })) : [];
      if (isCategorical && baseItems.length) {
        // Insertar 'Todos' al inicio
        if (!baseItems.find(it => it.value === ALL_VALUE)) {
          baseItems.unshift({ title: t('analytics.all'), value: ALL_VALUE });
        }
      }

      return {
        index: idx,
        title: q.title || q.question || t('analytics.question', { number: idx + 1 }),
        options,
        isCategorical,
        items: baseItems
      };
    });
  });

  return {
    filterDefinitions
  };
}
