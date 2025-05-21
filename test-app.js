const puppeteer = require("puppeteer");

async function testApplication() {
  console.log("Starting application test...");

  // Launch browser
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Navigate to the application
    console.log("Navigating to the application...");
    await page.goto("http://localhost:5175", { waitUntil: "networkidle2" });

    // Check if we're on the login page
    const loginPageTitle = await page.title();
    console.log(`Page title: ${loginPageTitle}`);

    // Check if login form exists
    const loginFormExists = await page.evaluate(() => {
      return (
        !!document.querySelector("form") ||
        !!document.querySelector('input[type="email"]') ||
        !!document.querySelector('input[type="password"]')
      );
    });

    console.log(`Login form exists: ${loginFormExists}`);

    if (loginFormExists) {
      // Try to login
      console.log("Attempting to login...");

      // Look for email/username input
      const emailInputExists = await page.evaluate(() => {
        return (
          !!document.querySelector('input[type="email"]') ||
          !!document.querySelector('input[name="email"]') ||
          !!document.querySelector('input[placeholder*="email" i]')
        );
      });

      if (emailInputExists) {
        await page.type(
          'input[type="email"], input[name="email"], input[placeholder*="email" i]',
          "test@example.com"
        );
      }

      // Look for password input
      const passwordInputExists = await page.evaluate(() => {
        return (
          !!document.querySelector('input[type="password"]') ||
          !!document.querySelector('input[name="password"]') ||
          !!document.querySelector('input[placeholder*="password" i]')
        );
      });

      if (passwordInputExists) {
        await page.type(
          'input[type="password"], input[name="password"], input[placeholder*="password" i]',
          "password123"
        );
      }

      // Look for login button
      const loginButtonExists = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll("button"));
        return buttons.some(
          (button) =>
            button.textContent.toLowerCase().includes("login") ||
            button.textContent.toLowerCase().includes("sign in")
        );
      });

      if (loginButtonExists) {
        await page.click(
          'button:has-text("Login"), button:has-text("Sign In"), button:has-text("Log In")'
        );
        await page
          .waitForNavigation({ waitUntil: "networkidle2" })
          .catch(() => {});
      }
    }

    // Check if we're on the dashboard or projects page
    console.log("Checking if we can access the projects page...");
    await page.goto("http://localhost:5175/projects", {
      waitUntil: "networkidle2",
    });

    // Check if projects page loaded
    const projectsPageContent = await page.content();
    const hasProjectsTable =
      projectsPageContent.includes("project") ||
      projectsPageContent.includes("Project") ||
      projectsPageContent.includes("table");

    console.log(
      `Projects page has project-related content: ${hasProjectsTable}`
    );

    // Try to expand a project row (if any)
    console.log("Looking for project rows...");

    // Take a screenshot to see what's on the page
    await page.screenshot({
      path: "/Users/christianguevara/Downloads/home/projects-page.png",
    });
    console.log("Saved screenshot of projects page to projects-page.png");

    // Try to find any clickable elements in the project rows
    const projectRowsExist = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr, div[role="row"]'));
      console.log("Found " + rows.length + " rows");
      return rows.length > 1; // More than just the header row
    });

    console.log(`Project rows exist: ${projectRowsExist}`);

    if (projectRowsExist) {
      // Click on the first project row to select it
      console.log("Clicking on the first project row...");
      await page.click('tr:nth-child(2), div[role="row"]:nth-child(2)');
      await page.waitForTimeout(1000);

      // Now look for expand buttons
      const expandButtonExists = await page.evaluate(() => {
        return (
          !!document.querySelector('button[aria-label="Expand row"]') ||
          !!document.querySelector('svg[data-icon="chevron-down"]') ||
          !!document.querySelector('svg[data-icon="chevron-right"]')
        );
      });

      if (expandButtonExists) {
        console.log(
          "Found expand button, clicking to expand project details..."
        );
        await page.click(
          'button[aria-label="Expand row"], svg[data-icon="chevron-down"], svg[data-icon="chevron-right"]'
        );
        await page.waitForTimeout(1000);

        // Take a screenshot after expanding
        await page.screenshot({
          path: "/Users/christianguevara/Downloads/home/expanded-project.png",
        });
        console.log(
          "Saved screenshot of expanded project to expanded-project.png"
        );

        // Check if our Payment Items button exists
        const paymentItemsButtonExists = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll("button"));
          return buttons.some((button) =>
            button.textContent.includes("Payment Items")
          );
        });

        console.log(`Payment Items button exists: ${paymentItemsButtonExists}`);

        if (paymentItemsButtonExists) {
          console.log("Clicking Payment Items button...");
          await page.click('button:has-text("Payment Items")');
          await page
            .waitForNavigation({ waitUntil: "networkidle2" })
            .catch(() => {});

          // Check if we're on the payment items page
          const pageUrl = page.url();
          const isPaymentItemsPage = pageUrl.includes("payment-items");

          console.log(`Navigated to Payment Items page: ${isPaymentItemsPage}`);
          console.log(`Current URL: ${pageUrl}`);

          // Take a screenshot of payment items page
          await page.screenshot({
            path: "/Users/christianguevara/Downloads/home/payment-items-page.png",
          });
          console.log(
            "Saved screenshot of payment items page to payment-items-page.png"
          );

          // Check if payment items table exists
          const paymentItemsTableExists = await page.evaluate(() => {
            return (
              !!document.querySelector("table") ||
              !!document.querySelector('div[role="grid"]')
            );
          });

          console.log(`Payment Items table exists: ${paymentItemsTableExists}`);
        } else {
          console.log(
            "Payment Items button not found. Let's try to navigate directly to the payment items page."
          );

          // Try to navigate directly to the payment items page for the first project
          await page.goto("http://localhost:5175/projects/1/payment-items", {
            waitUntil: "networkidle2",
          });

          // Take a screenshot
          await page.screenshot({
            path: "/Users/christianguevara/Downloads/home/direct-payment-items.png",
          });
          console.log(
            "Saved screenshot of direct navigation to payment-items to direct-payment-items.png"
          );

          // Check if we're on the payment items page
          const pageUrl = page.url();
          const isPaymentItemsPage = pageUrl.includes("payment-items");

          console.log(`Navigated to Payment Items page: ${isPaymentItemsPage}`);
          console.log(`Current URL: ${pageUrl}`);
        }
      } else {
        console.log(
          "No expand button found. Let's try to navigate directly to the payment items page."
        );

        // Try to navigate directly to the payment items page for the first project
        await page.goto("http://localhost:5175/projects/1/payment-items", {
          waitUntil: "networkidle2",
        });

        // Take a screenshot
        await page.screenshot({
          path: "/Users/christianguevara/Downloads/home/direct-payment-items.png",
        });
        console.log(
          "Saved screenshot of direct navigation to payment-items to direct-payment-items.png"
        );

        // Check if we're on the payment items page
        const pageUrl = page.url();
        const isPaymentItemsPage = pageUrl.includes("payment-items");

        console.log(`Navigated to Payment Items page: ${isPaymentItemsPage}`);
        console.log(`Current URL: ${pageUrl}`);
      }
    } else {
      console.log(
        "No project rows found. Let's try to navigate directly to the payment items page."
      );

      // Try to navigate directly to the payment items page for the first project
      await page.goto("http://localhost:5175/projects/1/payment-items", {
        waitUntil: "networkidle2",
      });

      // Take a screenshot
      await page.screenshot({
        path: "/Users/christianguevara/Downloads/home/direct-payment-items.png",
      });
      console.log(
        "Saved screenshot of direct navigation to payment-items to direct-payment-items.png"
      );

      // Check if we're on the payment items page
      const pageUrl = page.url();
      const isPaymentItemsPage = pageUrl.includes("payment-items");

      console.log(`Navigated to Payment Items page: ${isPaymentItemsPage}`);
      console.log(`Current URL: ${pageUrl}`);
    }

    console.log("Test completed successfully!");
  } catch (error) {
    console.error("Test failed with error:", error);
  } finally {
    await browser.close();
  }
}

testApplication();
