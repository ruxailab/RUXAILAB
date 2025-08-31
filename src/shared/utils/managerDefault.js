import { ACCESS_LEVEL } from "./accessLevel"

export const getNavigatorDefault = (test, accessLevel, route, type) => {
  if (!test) return [];

  const items = [
    { title: 'Manager', icon: 'mdi-home', path: `/${type}/manager/${route.params.id}` }
  ]

  if (accessLevel === ACCESS_LEVEL.ADMIN) {
    items.push(
      { title: 'Test', icon: 'mdi-file-document-edit', path: `/${type}/edit/${test.id}` },
      { title: 'Preview', icon: 'mdi-file-eye', path: `/testview/${test.id}` },
      { title: 'Reports', icon: 'mdi-book-multiple', path: `/${type}/report/${test.id}` },
      { title: 'Answers', icon: 'mdi-order-bool-ascending-variant', path: `/${type}/answers/${test.id}` },
      { title: 'Cooperators', icon: 'mdi-account-group', path: `/${type}/cooperators/${test.id}` },
      { title: 'Settings', icon: 'mdi-cog', path: `/${type}/settings/${test.id}` }
    )
  }

  if (accessLevel === ACCESS_LEVEL.GUEST) {
    items.push(
      { title: 'Answer Test', icon: 'mdi-file-document', path: `/testview/${test.id}` },
      { title: 'Reports', icon: 'mdi-book-multiple', path: `/${type}/report/${test.id}` },
      { title: 'Answers', icon: 'mdi-order-bool-ascending-variant', path: `/${type}/answers/${test.id}` }
    )
  }

  return items
}

export const getTopCardsDefualt = (test, type) => {
  if (!test) return []
  return [
    {
      image: 'IntroEdit.svg',
      title: 'test',
      imageStyle: 'transform: rotateY(180deg);',
      bottom: '#000',
      description: 'edit',
      cardStyle:
        'background-image: radial-gradient(circle at top right, #d128c9, #9a1aab); overflow: hidden',
      path: `/${type}/edit/${test.id}`,
    },
    {
      image: 'IntroCoops.svg',
      title: 'cooperators',
      imageStyle: '',
      bottom: '#000',
      description: 'cooperators',
      cardStyle:
        'background-image: radial-gradient(circle at top right, #eff31a, #eecf22); overflow: hidden',
      path: `/${type}/cooperators/${test.cooperators}`,
    },
  ]
}

export const getBottomCardsDefualt = (test, type) => {
  if (!test || !test.answersDocId) return []
  return [
    {
      image: 'IntroReports.svg',
      title: 'reports',
      imageStyle: 'height: 250px',
      bottom: '#000',
      description: 'reports',
      cardStyle:
        'background-image: radial-gradient(circle at top right, #FF3C00, #FF0000); overflow: hidden',
      path: `/${type}/report/${test.answersDocId}`,
    },
    {
      image: 'IntroAnswer.svg',
      title: 'answers',
      imageStyle: 'height: 250px',
      bottom: '#000',
      description: 'answers',
      cardStyle:
        'background-image: radial-gradient(circle at top right, #9ac94f, #7eb543); overflow: hidden',
      path: `/${type}/answer/${test.answersDocId}`,
    },
  ]
}
