import { expect, test } from "@playwright/test";

const widths = [320, 360, 375, 390, 414, 768, 1024, 1440];
const hydrationMessage = /hydration|did not match|server rendered/i;

for (const width of widths) {
  test(`home layout is usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 768 ? 720 : 900 });
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1, name: /When your mind\s*won't cooperate\./ })).toBeVisible();
    await expect(page.getByText("Self-guided support for real life", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Find my next small step" })).toBeVisible();
    await expect(page.getByRole("radiogroup", { name: "Choose how today feels" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Everyday support is not emergency support." })).toBeVisible();

    await page.evaluate(() => document.fonts.ready);

    const dimensions = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
    }));
    expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
    expect(dimensions.body).toBeLessThanOrEqual(dimensions.viewport);

    if (width < 1024) {
      await expect(page.getByRole("button", { name: "Open navigation menu" })).toBeVisible();
    } else {
      await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
    }
  });
}

test("mobile drawer is complete and keyboard safe", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Open navigation menu" });
  await trigger.focus();
  await trigger.press("Enter");

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  for (const name of ["Paths", "Approach", "Inside", "Journal", "Sign in", "Create account"]) {
    await expect(dialog.getByRole("link", { name, exact: true })).toBeVisible();
  }
  for (const name of ["Light", "System", "Dark"]) {
    await expect(dialog.getByRole("radio", { name })).toBeVisible();
  }
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).overflow)).toBe("hidden");

  for (let index = 0; index < 16; index += 1) {
    await page.keyboard.press("Tab");
    const focusRemainedInside = await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]')));
    expect(focusRemainedInside).toBe(true);
  }

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe("hidden");

  await trigger.click();
  await dialog.getByRole("link", { name: "Paths", exact: true }).click();
  await expect(page).toHaveURL(/\/#paths$/);
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("heading", { name: "Different hard days need different doors in." })).toBeVisible();
});

test("pathfinder changes the suggested small practice without scoring the visitor", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const pathfinder = page.getByRole("radiogroup", { name: "Choose how today feels" });
  await expect(page.getByText("This is a reflective prompt, not an assessment, and nothing here is scored or saved.")).toBeVisible();
  await expect(pathfinder.getByRole("radio", { name: "I keep avoiding one thing" })).toBeChecked();
  await expect(page.getByRole("heading", { name: "Make the doorway tiny." })).toBeVisible();

  const overloaded = pathfinder.getByRole("radio", { name: "Everything feels like too much" });
  await overloaded.click();
  await expect(overloaded).toBeChecked();
  await expect(page.getByRole("heading", { name: "Take the pile out of your head." })).toBeVisible();
  await expect(page.getByText("3-minute sort", { exact: true })).toBeVisible();
});

test("theme defaults to light and honors saved and system choices", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await page.evaluate(() => localStorage.removeItem("curevo-theme"));
  await page.reload();
  await expect(page.locator("html")).not.toHaveClass(/dark/);

  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await page.getByRole("radio", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);

  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await page.getByRole("radio", { name: "System" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByRole("radio", { name: "Light" }).click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
});

test("reduced motion and auth first render remain readable", async ({ page }) => {
  const hydrationErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && hydrationMessage.test(message.text())) hydrationErrors.push(message.text());
  });
  page.on("pageerror", (error) => {
    if (hydrationMessage.test(error.message)) hydrationErrors.push(error.message);
  });

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  const pathCard = page.locator("#paths article").first();
  const motion = await pathCard.evaluate((element) => {
    const durationInMilliseconds = (value: string) => Math.max(...value.split(",").map((duration) => {
      const normalized = duration.trim();
      return normalized.endsWith("ms") ? Number.parseFloat(normalized) : Number.parseFloat(normalized) * 1000;
    }));
    const style = getComputedStyle(element);
    return {
      animationMilliseconds: durationInMilliseconds(style.animationDuration),
      transitionMilliseconds: durationInMilliseconds(style.transitionDuration),
    };
  });
  expect(motion.animationMilliseconds).toBeLessThanOrEqual(0.1);
  expect(motion.transitionMilliseconds).toBeLessThanOrEqual(0.1);

  await page.goto("/login");
  await expect(page.getByText(/Checking your session|Welcome back/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Return to your space" })).toBeVisible();
  expect(hydrationErrors).toEqual([]);
});
