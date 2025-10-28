describe('Concurrent study edit', () => {
  const studyId = 'test-stub-id'   // replace with a real seeded ID or env var

  beforeEach(() => {
    cy.login('admin@example.com', 'password') // use your cy login command
    cy.visit(`/admin/study/${studyId}/settings`)
  })

  it('shows conflict toast when another tab saves first', () => {
    // tab A: type a new title
    cy.get('input[type=text]').first().clear().type('Tab A title')

    // simulate tab B saving behind the scenes (cy intercept & stub)
    cy.intercept('PUT', `/api/studies/${studyId}`, (req) => {
      req.reply(409, { error: 'CONFLICT', serverVersion: 2 })
    }).as('conflict')

    // tab A: hit Save
    cy.get('[data-cy=save-button]').click()

    // wait for the 409 and assert toast
    cy.wait('@conflict')
    cy.contains('Someone else saved changes first').should('be.visible')
  })
})
