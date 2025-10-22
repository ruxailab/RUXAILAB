import HeuristicStudy from "@/ux/Heuristic/models/HeuristicStudy";
import UserStudy from "@/ux/UserTest/models/UserStudy";
import Study from "../models/Study";
import CardSortingStudy from "@/ux/CardSorting/models/CardSortingStudy";
import ManualAccessibilityTest from "@/ux/accessibility/models/ManualAccessibilityTest";
import AutomaticAccessibilityTest from "@/ux/accessibility/models/AutomaticAccessibilityTest";
import Cooperators from "../models/Cooperators";
import StudyAdmin from "@/shared/models/StudyAdmin";
import StudyAnswer from "../models/StudyAnswer";
import UserStudyAnswer from "@/ux/UserTest/models/UserStudyAnswer";
import HeuristicStudyAnswer from "@/ux/Heuristic/models/HeuristicStudyAnswer";
import CardSortingStudyAnswer from "@/ux/CardSorting/models/CardSortingStudyAnswer";

/**
 * Factory function to instantiate the correct study model based on type.
 * It also normalizes nested sub-models such as TestAdmin, Cooperators and Template.
 *
 * @param {string} type - The study type (USER, HEURISTIC, CARD_SORTING).
 * @param {Object} rawData - Raw data retrieved from the database.
 * @returns {Study|UserStudy|HeuristicStudy|CardSortingStudy}
 */
export function instantiateStudyByType(type, rawData) {
  const normalizedData = {
    ...rawData,
    testAdmin: rawData?.testAdmin ? new StudyAdmin(rawData.testAdmin) : null,
    cooperators: rawData?.cooperators
      ? rawData.cooperators.map((c) => new Cooperators(c))
      : [],
  };

  switch (type) {
    case STUDY_TYPES.USER:
      return new UserStudy(normalizedData);
    case STUDY_TYPES.HEURISTIC:
      return new HeuristicStudy(normalizedData);
    case STUDY_TYPES.CARD_SORTING:
      return new CardSortingStudy(normalizedData);
    case STUDY_TYPES.ACCESSIBILITY_MANUAL:
      return new ManualAccessibilityTest(normalizedData);
    case STUDY_TYPES.ACCESSIBILITY_AUTOMATIC:
      return new AutomaticAccessibilityTest(normalizedData);
    default:
      return new Study(normalizedData);
  }
}

/**
 * Factory function to instantiate the correct answer study model based on type.
 *
 * @param {string} type - The study type (USER, HEURISTIC, CARD_SORTING).
 * @param {Object} rawData - Raw data retrieved from the database.
 * @returns {StudyAnswer|UserStudyAnswer|HeuristicStudyAnswer|CardSortingStudyAnswer}
 */
export function instantiateStudyAnswerByType(type, rawData) {
  switch (type) {
    case STUDY_TYPES.USER:
      return new UserStudyAnswer(rawData);
    case STUDY_TYPES.HEURISTIC:
      return new HeuristicStudyAnswer(rawData);
    case STUDY_TYPES.CARD_SORTING:
      return new CardSortingStudyAnswer(rawData);
    default:
      return new StudyAnswer(rawData);
  }
}

/**
 * Enum for available study types.
 */
export const STUDY_TYPES = {
  USER: "USER",
  HEURISTIC: "HEURISTIC",
  CARD_SORTING: "CARD_SORTING",
  ACCESSIBILITY_MANUAL: "MANUAL",
  ACCESSIBILITY_AUTOMATIC: "AUTOMATIC",
};

/**
 * Enum for subtypes of user studies.
 */
export const USER_STUDY_SUBTYPES = {
  UNMODERATED: "USER_UNMODERATED",
  MODERATED: "USER_MODERATED",
};

/**
 * Enum for subtypes of heuristic studies.
 */
export const HEURISTIC_STUDY_SUBTYPES = {
  QUANTITATIVE: "QUANTITATIVE",
  QUALITATIVE: "QUALITATIVE",
};

/**
 * Categories of usability methods.
 */
export const METHOD_CATEGORIES = {
  test: {
    id: "test",
    name: "Pruebas con Usuarios",
    nameEn: "User Testing",
    description: "Methods that involve real users directly",
    icon: "mdi-account-group",
    color: "#4CAF50",
  },
  inquiry: {
    id: "inquiry",
    name: "Investigación",
    nameEn: "User Research",
    description: "Research and data collection methods",
    icon: "mdi-magnify",
    color: "#FF9800",
  },
  inspection: {
    id: "inspection",
    name: "Inspección",
    nameEn: "Expert Inspection",
    description: "Expert-driven evaluations",
    icon: "mdi-magnify-scan",
    color: "#2196F3",
  },
  accessibility: {
    id: "accessibility",
    name: "Accesibilidad",
    nameEn: "Accessibility",
    description: "Web accessibility evaluations",
    icon: "mdi-wheelchair-accessibility",
    color: "#009688",
  },
  other: {
    id: "other",
    name: "Otros",
    nameEn: "Other",
    description: "Other UX research methods",
    icon: "mdi-dots-horizontal",
    color: "#9E9E9E",
  },
};

/**
 * Enum for method statuses.
 */
export const METHOD_STATUSES = {
  AVAILABLE: {
    id: "AVAILABLE",
    name: "Disponible",
    nameEn: "Available",
    description: "Method is fully functional",
    color: "#4CAF50",
    icon: "mdi-check-circle",
  },
  NOT_AVAILABLE: {
    id: "NOT_AVAILABLE",
    name: "No Disponible",
    nameEn: "Not Available",
    description: "Method is currently unavailable",
    color: "#F44336",
    icon: "mdi-close-circle",
  },
  COMING_SOON: {
    id: "COMING_SOON",
    name: "Próximamente",
    nameEn: "Coming Soon",
    description: "Method is under development",
    color: "#FF9800",
    icon: "mdi-clock-outline",
  },
  IMPROVING: {
    id: "IMPROVING",
    name: "Mejorando",
    nameEn: "Improving",
    description: "Method is being improved",
    color: "#2196F3",
    icon: "mdi-progress-wrench",
  },
};

/**
 * Definitions for all supported UX research methods.
 */
export const METHOD_DEFINITIONS = {
  HEURISTICS: {
    id: "HEURISTICS",
    name: "Heuristic Evaluation",
    nameEn: "Heuristic Evaluation",
    icon: "mdi-clipboard-check",
    color: "#2196F3",
    description: "Interface evaluation based on usability principles",
    category: METHOD_CATEGORIES.inspection.id,
    status: METHOD_STATUSES.AVAILABLE.id,
  },
  USER_MODERATED: {
    id: "USER_MODERATED",
    name: "Moderated User Test",
    nameEn: "Moderated Usability Test",
    icon: "mdi-account-voice",
    color: "#4CAF50",
    description: "Live moderated usability test",
    category: METHOD_CATEGORIES.test.id,
    status: METHOD_STATUSES.AVAILABLE.id,
  },
  USER_UNMODERATED: {
    id: "USER_UNMODERATED",
    name: "Unmoderated User Test",
    nameEn: "Unmoderated Usability Test",
    icon: "mdi-monitor-screenshot",
    color: "#FF9800",
    description: "Automated usability test without moderator",
    category: METHOD_CATEGORIES.test.id,
    status: METHOD_STATUSES.AVAILABLE.id,
  },
  SURVEY: {
    id: "SURVEY",
    name: "Survey",
    nameEn: "Survey",
    icon: "mdi-clipboard-text",
    color: "#FF5722",
    description: "Data collection via surveys",
    category: METHOD_CATEGORIES.inquiry.id,
    status: METHOD_STATUSES.COMING_SOON.id,
  },
  INTERVIEW: {
    id: "INTERVIEW",
    name: "Interview",
    nameEn: "Interview",
    icon: "mdi-microphone",
    color: "#E91E63",
    description: "Qualitative user interviews",
    category: METHOD_CATEGORIES.inquiry.id,
    status: METHOD_STATUSES.COMING_SOON.id,
  },
  CARD_SORTING: {
    id: "CARD_SORTING",
    name: "Card Sorting",
    nameEn: "Card Sorting",
    icon: "mdi-cards",
    color: "#3F51B5",
    description: "Content organization through card sorting",
    category: METHOD_CATEGORIES.inquiry.id,
    status: METHOD_STATUSES.IMPROVING.id,
  },
  COGNITIVE_WALKTHROUGH: {
    id: "COGNITIVE_WALKTHROUGH",
    name: "Recorrido Cognitivo",
    nameEn: "Cognitive Walkthrough",
    icon: "mdi-brain",
    color: "#795548",
    description: "Step-by-step evaluation of cognitive tasks",
    category: METHOD_CATEGORIES.inspection.id,
    status: METHOD_STATUSES.NOT_AVAILABLE.id,
  },
  ACCESSIBILITY_MANUAL: {
    id: "ACCESSIBILITY_MANUAL",
    name: "Accessibility Manual Evaluation",
    nameEn: "Manual Evaluation",
    icon: "mdi-hand-extended",
    color: "#607D8B",
    description: "Manual accessibility evaluation",
    category: METHOD_CATEGORIES.accessibility.id,
    status: METHOD_STATUSES.AVAILABLE.id,
  },
  ACCESSIBILITY_AUTOMATIC: {
    id: "ACCESSIBILITY_AUTOMATIC",
    name: "Accessibility Automatic Evaluation",
    nameEn: "Automatic Evaluation",
    icon: "mdi-robot",
    color: "#795548",
    description: "Automated accessibility evaluation",
    category: METHOD_CATEGORIES.accessibility.id,
    status: METHOD_STATUSES.AVAILABLE.id,
  },
  WCAG_AUDIT: {
    id: "WCAG_AUDIT",
    name: "Auditoría WCAG",
    nameEn: "WCAG Audit",
    icon: "mdi-shield-check",
    color: "#009688",
    description: "Full WCAG compliance audit",
    category: METHOD_CATEGORIES.accessibility.id,
    status: METHOD_STATUSES.IMPROVING.id,
  },
};

/**
 * Retrieves the full definition of a method given its type and subtype.
 */
export const getMethodDefinition = (testType, subType = "") => {
  const type = testType?.toUpperCase() || "";
  const subtype = subType?.toUpperCase() || "";

  switch (type) {
    case STUDY_TYPES.USER: {
      if (subtype === USER_STUDY_SUBTYPES.UNMODERATED) {
        return METHOD_DEFINITIONS.USER_UNMODERATED;
      }
      if (subtype === USER_STUDY_SUBTYPES.MODERATED) {
        return METHOD_DEFINITIONS.USER_MODERATED;
      }
      return null;
    }
    case STUDY_TYPES.HEURISTIC:
      return METHOD_DEFINITIONS.HEURISTICS;
    case STUDY_TYPES.CARD_SORTING:
      return METHOD_DEFINITIONS.CARD_SORTING;
    default:
      return null;
  }
};

export const getMethodManagerView = (type, subType) => {
  if (type === STUDY_TYPES.HEURISTIC) return 'HeuristicManagerView'
  else if (type === STUDY_TYPES.CARD_SORTING) return 'CardSortingManagerView'
  else if (type === STUDY_TYPES.USER) {
    if (subType === USER_STUDY_SUBTYPES.UNMODERATED) return 'UserUnmoderatedManagerView'
    else if (subType === USER_STUDY_SUBTYPES.MODERATED) return 'UserModeratedManagerView'
  }
}

/**
 * Retrieves the icon for a given method.
 */
export const getMethodIcon = (item) => {
  const testType = item.testType ?? item.header?.templateType ?? "";
  const subType = item.subType ?? item.header?.templateSubType ?? "";
  const definition = getMethodDefinition(testType, subType);
  return definition?.icon ?? "mdi-help-circle";
};

/**
 * Retrieves the color for a given method.
 */
export const getMethodColor = (item) => {
  const testType = item.testType ?? item.header?.templateType ?? "";
  const subType = item.subType ?? item.header?.templateSubType ?? "";
  const definition = getMethodDefinition(testType, subType);
  return definition?.color ?? "#9E9E9E";
};

/**
 * Retrieves the display name for a given method.
 */
export const getMethodName = (item, lang = "es") => {
  const testType = item.testType ?? item.header?.templateType ?? "";
  const subType = item.subType ?? item.header?.templateSubType ?? "";
  const definition = getMethodDefinition(testType, subType);
  if (!definition) return lang === "en" ? "Unknown Method" : "Método desconocido";
  return lang === "en" ? definition.nameEn : definition.name;
};

/**
 * Retrieves the status object for a given method.
 */
export const getMethodStatus = (item) => {
  const testType = item.testType ?? item.header?.templateType ?? "";
  const subType = item.subType ?? item.header?.templateSubType ?? "";
  const definition = getMethodDefinition(testType, subType);
  return METHOD_STATUSES[definition.status];
};

/**
 * Retrieves the category object for a given method.
 */
export const getMethodCategory = (item) => {
  const testType = item.testType ?? item.header?.templateType ?? "";
  const subType = item.subType ?? item.header?.templateSubType ?? "";
  const definition = getMethodDefinition(testType, subType);
  return METHOD_CATEGORIES[definition?.category];
};

/**
 * Groups all methods by their categories.
 */
export const getMethodsByCategory = () => {
  const categories = {};
  Object.values(METHOD_DEFINITIONS).forEach((method) => {
    if (!categories[method.category]) {
      categories[method.category] = [];
    }
    categories[method.category].push(method);
  });
  return categories;
};

/**
 * Retrieves all methods filtered by status.
 */
export const getMethodsByStatus = (status) => {
  return Object.values(METHOD_DEFINITIONS).filter(
    (method) => method.status === status
  );
};

/**
 * Retrieves all methods filtered by a specific category.
 */
export const getMethodsBySpecificCategory = (category) => {
  return Object.values(METHOD_DEFINITIONS).filter(
    (method) => method.category === category
  );
};

/**
 * Returns all method options for select inputs.
 */
export const getMethodOptions = (
  lang = "es",
  filterStatus = null,
  filterCategory = null
) => {
  let methods = Object.values(METHOD_DEFINITIONS);

  if (filterStatus) {
    methods = methods.filter((method) => method.status === filterStatus);
  }
  if (filterCategory) {
    methods = methods.filter((method) => method.category === filterCategory);
  }

  return methods.map((method) => ({
    value: method.id,
    text: lang === "en" ? method.nameEn : method.name,
    icon: method.icon,
    color: method.color,
    status: method.status,
    category: method.category,
    statusInfo: METHOD_STATUSES[method.status],
    categoryInfo: METHOD_CATEGORIES[method.category],
  }));
};

/**
 * Returns all available categories for select inputs.
 */
export const getCategoryOptions = (lang = "es") => {
  return Object.values(METHOD_CATEGORIES).map((category) => ({
    value: category.id,
    text: lang === "en" ? category.nameEn : category.name,
    description: category.description,
    icon: category.icon,
    color: category.color,
  }));
};

/**
 * Returns all available statuses for select inputs.
 */
export const getStatusOptions = (lang = "es") => {
  return Object.values(METHOD_STATUSES).map((status) => ({
    value: status.id,
    text: lang === "en" ? status.nameEn : status.name,
    description: status.description,
    icon: status.icon,
    color: status.color,
  }));
};
