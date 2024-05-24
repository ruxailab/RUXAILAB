const { test, expect } = require('@playwright/test')

test('has link page', async ({ page }) => {
  await page.goto('https://ruxailab-prod.web.app/')

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/RUXAILAB/)
})

test('sign and create heurisic test', async ({ page }) => {
  await page.goto('https://ruxailab-prod.web.app/signin')
  await page
    .getByRole('textbox', { name: 'E-mail' })
    .fill('testemail@gmail.com')
  await page.getByRole('textbox', { name: 'Password' }).fill('password123')
  await page.click('.v-btn.v-btn--is-elevated.v-btn--has-bg.v-btn--rounded')

  await page.click(
    'button.v-btn.v-btn--bottom.v-btn--is-elevated.v-btn--fab.v-btn--fixed.v-btn--has-bg.v-btn--right.v-btn--round',
  )
  await page.waitForTimeout(2000) // 2 segundo de delay
  await page.click('.card-title:has-text("Create a blank test")')

  await page.click('.card.col-sm-10.col-md-5.col-10')
  await page
    .getByRole('textbox', { name: 'Test Name' })
    .fill('Test heuristic playwright')
  await page
    .getByRole('textbox', { name: 'Test Description' })
    .fill('Some descripton')

  await page.click(
    '.ml-auto.mr-2.circleOrange.v-btn.v-btn--fab.v-btn--has-bg.v-btn--round.theme--dark.v-size--default.orange',
  )
  // back console
  await page.waitForTimeout(2000) // 2 segundo de delay
  await page.click(
    '.console-button.mx-1.hidden-sm-and-down.v-btn.v-btn--text.theme--dark.v-size--default',
  )
})

test('sign and create usability test', async ({ page }) => {
  /*login*/
  await page.goto('https://ruxailab-prod.web.app/signin')
  await page.waitForTimeout(2000) // 2 segundo de delay
  await page
    .getByRole('textbox', { name: 'E-mail' })
    .fill('testemail@gmail.com')
  await page.getByRole('textbox', { name: 'Password' }).fill('password123')
  await page.click('.v-btn.v-btn--is-elevated.v-btn--has-bg.v-btn--rounded')

  await page.click(
    'button.v-btn.v-btn--bottom.v-btn--is-elevated.v-btn--fab.v-btn--fixed.v-btn--has-bg.v-btn--right.v-btn--round',
  )
  await page.waitForTimeout(2000) // 2 segundo de delay
  await page.click('.card-title:has-text("Create a blank test")')
  await page.click('.card.col-sm-10.col-md-5.col-12')
  await page
    .getByRole('textbox', { name: 'Test Name' })
    .fill('Test usability playwright')
  await page
    .getByRole('textbox', { name: 'Test Description' })
    .fill('Some descripton')

  await page.click(
    '.ml-auto.mr-2.circleOrange.v-btn.v-btn--fab.v-btn--has-bg.v-btn--round.theme--dark.v-size--default.orange',
  )
  // type test
  await page.click('.card.col-sm-10.col-md-4.col-10') /*selfTEst */

  // back console
  await page.click(
    '.console-button.mx-1.hidden-sm-and-down.v-btn.v-btn--text.theme--dark.v-size--default',
  )
})

test('sign and create template', async ({ page }) => {
  /*login*/
  await page.goto('https://ruxailab-prod.web.app/signin')
  await page.waitForTimeout(2000) // 2 segundo de delay
  await page
    .getByRole('textbox', { name: 'E-mail' })
    .fill('testemail@gmail.com')
  await page.getByRole('textbox', { name: 'Password' }).fill('password123')
  await page.click('.v-btn.v-btn--is-elevated.v-btn--has-bg.v-btn--rounded')

  await page.click(
    'button.v-btn.v-btn--bottom.v-btn--is-elevated.v-btn--fab.v-btn--fixed.v-btn--has-bg.v-btn--right.v-btn--round',
  )
  await page.waitForTimeout(2000) // 2 segundo de delay
  await page.click('.card-title:has-text("Create from template")')
  //create MARCTEST
  await page.click('.v-list-item.v-list-item--link.theme--light')
  await page.waitForTimeout(2000) // 2 segundo de delay
  await page.getByRole('button', { name: 'NEXT' }).click()
  await page
    .getByRole('textbox', { name: 'Title' })
    .fill('Test template playwrigth')
  await page
    .getByRole('textbox', { name: 'Description' })
    .fill('Some description for template')
  await page.waitForTimeout(2000) // 2 segundo de delay
  await page.getByRole('button', { name: 'CREATE' }).click()
  // back console
  await page.click(
    '.console-button.mx-1.hidden-sm-and-down.v-btn.v-btn--text.theme--dark.v-size--default',
  )
})
