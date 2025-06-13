import { test, expect } from '@playwright/test';


test.describe('Sign-Up Flow', () => {

  test('should sign up successfully using a valid Google account', async ({ page }) => {
    await page.goto('http://localhost:8080/')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await page.getByText("Don't have an account yet?").click()
    const page1Promise = page.waitForEvent('popup')
    await page.getByRole('button', { name: 'Continue with Google' }).click()
    const page1 = await page1Promise
    await page1
      .getByLabel('Email or phone')
      .fill('betterhealthfinances@gmail.com')
    await page1.getByRole('button', { name: 'Next' }).click()
    await page1.getByLabel('Enter your password').fill('betterhealth1234')
    await page1.getByRole('button', { name: 'Next' }).click()
    await page.goto('http://localhost:8080/')
  })

  test('should show an error because email is alreafy registered', async ({ page }) => {
    await page.goto('http://localhost:8080/');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByText('Don\'t have an account yet?').click();
    await page.getByLabel('Email').click();
    await page.getByLabel('Email').fill('betterhealthfinances@gmail.com');
    await page.getByLabel('Password', { exact: true }).click();
    await page.getByLabel('Password', { exact: true }).press('CapsLock');
    await page.getByLabel('Password', { exact: true }).fill('B');
    await page.getByLabel('Password', { exact: true }).press('CapsLock');
    await page.getByLabel('Password', { exact: true }).fill('Betterhealth.');
    await page.getByLabel('Confirm your password', { exact: true }).click();
    await page.getByLabel('Confirm your password', { exact: true }).press('CapsLock');
    await page.getByLabel('Confirm your password', { exact: true }).fill('B');
    await page.getByLabel('Confirm your password', { exact: true }).press('CapsLock');
    await page.getByLabel('Confirm your password', { exact: true }).fill('Betterhealth.');
    await page.getByRole('button', { name: 'Sign-up' }).click();
    await page.getByText('FIREBASE: auth/email-already-').click();
  });


  test('should sign up successfully with a valid email and password', async ({ page }) => {
    await page.goto('http://localhost:8080/')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await page.getByText("Don't have an account yet?").click()
    await page.getByLabel('Email').click()
    await page.getByLabel('Email').fill('betterhealthmutua@gmail.com')
    await page.getByLabel('Password', { exact: true }).click()
    await page.getByLabel('Password', { exact: true }).fill('')
    await page.getByLabel('Password', { exact: true }).press('CapsLock')
    await page.getByLabel('Password', { exact: true }).fill('B')
    await page.getByLabel('Password', { exact: true }).press('CapsLock')
    await page.getByLabel('Password', { exact: true }).fill('Betterhealth.')
    await page.getByLabel('Confirm your password', { exact: true }).click()
    await page
      .getByLabel('Confirm your password', { exact: true })
      .fill('betterhealth.')
    await page.getByLabel('Confirm your password', { exact: true }).press('Enter')
    await page.getByLabel('Confirm your password appended action').click()
    await page.getByLabel('Confirm your password', { exact: true }).click()
    await page
      .getByLabel('Confirm your password', { exact: true })
      .press('ArrowLeft')
    await page
      .getByLabel('Confirm your password', { exact: true })
      .press('ArrowLeft')
    await page
      .getByLabel('Confirm your password', { exact: true })
      .press('ArrowLeft')
    await page
      .getByLabel('Confirm your password', { exact: true })
      .press('ArrowLeft')
    await page
      .getByLabel('Confirm your password', { exact: true })
      .press('ArrowLeft')
    await page
      .getByLabel('Confirm your password', { exact: true })
      .press('ArrowLeft')
    await page
      .getByLabel('Confirm your password', { exact: true })
      .press('ArrowLeft')
    await page
      .getByLabel('Confirm your password', { exact: true })
      .press('ArrowLeft')
    await page
      .getByLabel('Confirm your password', { exact: true })
      .press('ArrowLeft')
    await page
      .getByLabel('Confirm your password', { exact: true })
      .fill('etterhealth.')
    await page
      .getByLabel('Confirm your password', { exact: true })
      .press('CapsLock')
    await page
      .getByLabel('Confirm your password', { exact: true })
      .fill('Betterhealth.')
    await page
      .getByLabel('Confirm your password', { exact: true })
      .press('CapsLock')
    await page.getByRole('button', { name: 'Sign-up' }).click()
    await page.getByRole('button', { name: 'Go to Console' }).click()
    await page
      .locator('.pa-0')
      .first()
      .click()
    await page.getByText('profile').click()
    await page.getByRole('tab', { name: 'Security' }).click()
    await page.getByText('Delete Account').click()
    await page.getByRole('button', { name: 'deleteAccount' }).click()
    await page.locator('#input-318').click()
    await page.locator('#input-318').press('CapsLock')
    await page.locator('#input-318').fill('DELETE')
    await page.getByRole('button', { name: 'proceed' }).click()
    await page.getByLabel('Your Password').click()
    await page.getByLabel('Your Password').press('CapsLock')
    await page.getByLabel('Your Password').fill('b')
    await page.getByLabel('Your Password').press('CapsLock')
    await page.getByLabel('Your Password').fill('B')
    await page.getByLabel('Your Password').press('CapsLock')
    await page.getByLabel('Your Password').fill('Betterhealth.')
    await page.getByRole('button', { name: 'deleteForever' }).click()
  })


});
