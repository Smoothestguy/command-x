const puppeteer = require('puppeteer');

async function testPaymentItems() {
  console.log('Starting payment items test...');
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to the application
    console.log('Navigating to the application...');
    await page.goto('http://localhost:5175', { waitUntil: 'networkidle2' });
    
    // Navigate to the projects page
    console.log('Navigating to the projects page...');
    await page.goto('http://localhost:5175/projects', { waitUntil: 'networkidle2' });
    
    // Take a screenshot of the projects page
    await page.screenshot({ path: '/Users/christianguevara/Downloads/home/projects-page.png' });
    console.log('Saved screenshot of projects page to projects-page.png');
    
    // Navigate directly to the payment items page for project 1
    console.log('Navigating to the payment items page...');
    await page.goto('http://localhost:5175/projects/1/payment-items', { waitUntil: 'networkidle2' });
    
    // Take a screenshot of the payment items page
    await page.screenshot({ path: '/Users/christianguevara/Downloads/home/payment-items-page.png' });
    console.log('Saved screenshot of payment items page to payment-items-page.png');
    
    // Check if the Add Payment Item button exists
    const addButtonExists = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.some(button => button.textContent.includes('Add Payment Item'));
    });
    
    console.log(`Add Payment Item button exists: ${addButtonExists}`);
    
    if (addButtonExists) {
      // Click the Add Payment Item button
      console.log('Clicking Add Payment Item button...');
      await page.click('button:has-text("Add Payment Item")');
      await page.waitForTimeout(1000);
      
      // Take a screenshot of the add payment item dialog
      await page.screenshot({ path: '/Users/christianguevara/Downloads/home/add-payment-item-dialog.png' });
      console.log('Saved screenshot of add payment item dialog to add-payment-item-dialog.png');
      
      // Check if the dialog is open
      const dialogExists = await page.evaluate(() => {
        return !!document.querySelector('[role="dialog"]');
      });
      
      console.log(`Add Payment Item dialog exists: ${dialogExists}`);
      
      if (dialogExists) {
        // Fill out the form
        console.log('Filling out the form...');
        
        // Description
        await page.type('input[name="description"]', 'Test Payment Item');
        
        // Unit of Measure
        await page.type('input[name="unit_of_measure"]', 'each');
        
        // Unit Price
        await page.type('input[name="unit_price"]', '100');
        
        // Quantity
        await page.type('input[name="original_quantity"]', '5');
        
        // Take a screenshot of the filled form
        await page.screenshot({ path: '/Users/christianguevara/Downloads/home/filled-form.png' });
        console.log('Saved screenshot of filled form to filled-form.png');
        
        // Submit the form
        console.log('Submitting the form...');
        const submitButton = await page.$('button[type="submit"]');
        if (submitButton) {
          await submitButton.click();
          await page.waitForTimeout(1000);
        } else {
          console.log('Submit button not found');
        }
        
        // Take a screenshot after submission
        await page.screenshot({ path: '/Users/christianguevara/Downloads/home/after-submission.png' });
        console.log('Saved screenshot after submission to after-submission.png');
      }
    }
    
    // Check if there are any payment items in the table
    const tableRowsCount = await page.evaluate(() => {
      const rows = document.querySelectorAll('table tbody tr');
      return rows.length;
    });
    
    console.log(`Number of payment items in the table: ${tableRowsCount}`);
    
    // If there are payment items, try to edit one
    if (tableRowsCount > 0) {
      // Click the edit button on the first row
      console.log('Clicking edit button on the first row...');
      const editButtons = await page.$$('button[title="Edit item"]');
      if (editButtons.length > 0) {
        await editButtons[0].click();
        await page.waitForTimeout(1000);
        
        // Take a screenshot of the edit dialog
        await page.screenshot({ path: '/Users/christianguevara/Downloads/home/edit-dialog.png' });
        console.log('Saved screenshot of edit dialog to edit-dialog.png');
        
        // Check if the edit dialog is open
        const editDialogExists = await page.evaluate(() => {
          return !!document.querySelector('[role="dialog"]');
        });
        
        console.log(`Edit dialog exists: ${editDialogExists}`);
        
        if (editDialogExists) {
          // Update the description
          await page.evaluate(() => {
            const input = document.querySelector('input[name="description"]');
            if (input) {
              input.value = '';
            }
          });
          await page.type('input[name="description"]', 'Updated Payment Item');
          
          // Take a screenshot of the updated form
          await page.screenshot({ path: '/Users/christianguevara/Downloads/home/updated-form.png' });
          console.log('Saved screenshot of updated form to updated-form.png');
          
          // Submit the form
          console.log('Submitting the updated form...');
          const updateButton = await page.$('button[type="submit"]');
          if (updateButton) {
            await updateButton.click();
            await page.waitForTimeout(1000);
          } else {
            console.log('Update button not found');
          }
          
          // Take a screenshot after update
          await page.screenshot({ path: '/Users/christianguevara/Downloads/home/after-update.png' });
          console.log('Saved screenshot after update to after-update.png');
        }
      } else {
        console.log('Edit button not found');
      }
      
      // Try to delete a payment item
      console.log('Clicking delete button on the first row...');
      const deleteButtons = await page.$$('button[title="Delete item"]');
      if (deleteButtons.length > 0) {
        await deleteButtons[0].click();
        await page.waitForTimeout(1000);
        
        // Take a screenshot of the delete confirmation dialog
        await page.screenshot({ path: '/Users/christianguevara/Downloads/home/delete-dialog.png' });
        console.log('Saved screenshot of delete dialog to delete-dialog.png');
        
        // Check if the delete dialog is open
        const deleteDialogExists = await page.evaluate(() => {
          return !!document.querySelector('[role="alertdialog"]');
        });
        
        console.log(`Delete dialog exists: ${deleteDialogExists}`);
        
        if (deleteDialogExists) {
          // Confirm deletion
          console.log('Confirming deletion...');
          const confirmButton = await page.$('button:has-text("Delete")');
          if (confirmButton) {
            await confirmButton.click();
            await page.waitForTimeout(1000);
          } else {
            console.log('Confirm delete button not found');
          }
          
          // Take a screenshot after deletion
          await page.screenshot({ path: '/Users/christianguevara/Downloads/home/after-delete.png' });
          console.log('Saved screenshot after deletion to after-delete.png');
        }
      } else {
        console.log('Delete button not found');
      }
    }
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    await browser.close();
  }
}

testPaymentItems();
