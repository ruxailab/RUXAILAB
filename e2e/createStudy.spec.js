import { test, expect } from '@playwright/test';
//creating a heuristic study

const studyName = `test-study-${Date.now()}`;

const login = async (page)=>{
  await test.step('Navigate to signin page', async () => {
    await page.goto('http://localhost:8080/signin', { waitUntil: 'networkidle' });
  });

  await test.step('Fill login credentials', async () => {
    await page.getByLabel('Email').fill('dfa@dfa.com');
    await page.getByLabel('Password', { exact: true }).fill('Password@123');
  });

  await test.step('Click "Sign In" button', async () => {
    await page.getByTestId('sign-in-button').click();
    await expect(page).toHaveURL(/admin/);
  });
}
//3.--study type--
const studyType = async (page) => {
  await page.locator('text=Start with Blank Study').click();//update by adding TestId
}
//4.--details--
const fillDetails = async (page) => {
  //update by adding TestId
  await page.getByLabel('Study Title').fill(studyName);
  await page.getByLabel('Study Description').fill('success');

  await page.getByRole('button',{ name: /Create Study/}).click();
}

const verifyStudy = async (page) => {
    await expect(page.getByRole('heading',{ name: studyName })).toBeVisible({ timeout: 7000 });
}

test.describe('Study Creation',() => {

    test.use({//lock viewport to ensure consistent dektop layout ,and to avoid(menu/create study) for smaller viewports
        viewport: { width: 1280, height: 720 }
    })

    test.beforeEach(async ({page}) => {
        await login(page);
    })

    //category-Inspection
    test('admin can create an Heuristic Study',async ({page}) => {
        await test.step('Verify and click create-new-study button',async () => {
            await page.locator('button:has-text("Create new study")').first().click();
        });

        await test.step('1.choosing Category',async () => {
            await page.locator('text=Inspection').click();//update by adding TestId
        });

        await test.step('2.choosing Methods',async () => {
            await page.locator('text=Heuristic Evaluation').click();//update by adding TestId
        });

        await test.step('3.choosing Study Type',async () => {
            await studyType(page);
        });

        await test.step('4.Filling Study Details',async () => {
            await fillDetails(page);
        });

        await test.step('verifying created study',async () => {
            await verifyStudy(page);
        });

    })
})