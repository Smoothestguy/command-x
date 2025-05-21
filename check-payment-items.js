const puppeteer = require("puppeteer");

async function checkPaymentItemsPage() {
  console.log("Checking payment items page...");

  // Launch browser
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  // Collect console logs
  const consoleMessages = [];

  try {
    const page = await browser.newPage();

    // Capture console logs
    page.on("console", (message) => {
      consoleMessages.push({
        type: message.type(),
        text: message.text(),
      });
    });

    // Capture network errors
    page.on("pageerror", (error) => {
      consoleMessages.push({
        type: "pageerror",
        text: error.message,
      });
    });

    // Navigate directly to the payment items page
    console.log("Navigating to the payment items page...");
    await page.goto("http://localhost:5175/projects/1/payment-items", {
      waitUntil: "networkidle2",
    });

    // Take a screenshot
    await page.screenshot({
      path: "/Users/christianguevara/Downloads/home/payment-items-page.png",
    });
    console.log(
      "Saved screenshot of payment items page to payment-items-page.png"
    );

    // Check page content
    const pageContent = await page.content();

    // Check for key elements
    const hasPaymentItemsTitle = pageContent.includes("Payment Items");
    const hasTable =
      pageContent.includes("<table") || pageContent.includes('role="grid"');
    const hasAddButton = pageContent.includes("Add Payment Item");

    console.log(`Page has 'Payment Items' title: ${hasPaymentItemsTitle}`);
    console.log(`Page has table element: ${hasTable}`);
    console.log(`Page has 'Add Payment Item' button: ${hasAddButton}`);

    // Check for specific elements using evaluate
    const pageElements = await page.evaluate(() => {
      return {
        title: document.querySelector("h1")?.textContent || "No title found",
        tableExists: !!document.querySelector("table"),
        tableHeaders: Array.from(
          document.querySelectorAll('th, [role="columnheader"]')
        ).map((th) => th.textContent.trim()),
        tableRows: document.querySelectorAll('tbody tr, [role="row"]').length,
        addButtonExists: Array.from(document.querySelectorAll("button")).some(
          (btn) => btn.textContent.includes("Add Payment Item")
        ),
        errorMessages: Array.from(
          document.querySelectorAll('.error, [role="alert"]')
        ).map((el) => el.textContent.trim()),
      };
    });

    console.log("Page title:", pageElements.title);
    console.log("Table exists:", pageElements.tableExists);
    console.log("Table headers:", pageElements.tableHeaders);
    console.log("Table row count:", pageElements.tableRows);
    console.log("Add button exists:", pageElements.addButtonExists);

    if (pageElements.errorMessages.length > 0) {
      console.log("Error messages found:", pageElements.errorMessages);
    } else {
      console.log("No error messages found on the page");
    }

    // Check if the page has any loading indicators
    const hasLoadingIndicator = await page.evaluate(() => {
      return !!document.querySelector('.loading, [aria-busy="true"], .spinner');
    });

    console.log(`Page has loading indicator: ${hasLoadingIndicator}`);

    // Print all console messages
    console.log("\nConsole messages:");
    if (consoleMessages.length === 0) {
      console.log("No console messages captured");
    } else {
      consoleMessages.forEach((msg, index) => {
        console.log(`[${index + 1}] [${msg.type}] ${msg.text}`);
      });
    }

    // Check for specific error patterns
    const errorMessages = consoleMessages.filter(
      (msg) =>
        msg.type === "error" ||
        msg.type === "pageerror" ||
        (msg.type === "warning" && msg.text.includes("error"))
    );

    if (errorMessages.length > 0) {
      console.log("\nError messages found:");
      errorMessages.forEach((msg, index) => {
        console.log(`[${index + 1}] [${msg.type}] ${msg.text}`);
      });
    }

    console.log("\nCheck completed successfully!");
  } catch (error) {
    console.error("Check failed with error:", error);
  } finally {
    await browser.close();
  }
}

checkPaymentItemsPage();
