console.log("Content script loaded");

let selectedTone = 'professional'; // Default tone

function createToneDropdown() {
    const dropdown = document.createElement('select');
    dropdown.className = 'email-writer-tone-dropdown';
    dropdown.style.cssText = 'margin-right: 8px; padding: 6px 10px; font-size: 13px; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; background-color: white; font-family: Arial, sans-serif;';
    dropdown.setAttribute('aria-label', 'Select email tone');
    
    const tones = ['professional', 'casual', 'formal', 'friendly'];
    tones.forEach(tone => {
        const option = document.createElement('option');
        option.value = tone;
        option.textContent = tone.charAt(0).toUpperCase() + tone.slice(1);
        if (tone === 'professional') option.selected = true;
        dropdown.appendChild(option);
    });
    
    dropdown.addEventListener('change', (e) => {
        selectedTone = e.target.value;
        console.log('Selected tone:', selectedTone);
    });
    
    return dropdown;
}

function createButton() {
    const button = document.createElement('button');
    button.className = 'T-I J-J5-Ji aoO T-I-atl';
    button.style.cssText = 'margin-right: 8px; padding: 8px 12px; font-size: 13px; background-color: #1f71b8; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;';
    button.textContent = 'AI Write';
    button.setAttribute('aria-label', 'Generate with AI');
    return button;
}

function findToolbar() {
    // Look for the compose toolbar (the one with Send button)
    const toolbars = document.querySelectorAll('[role="toolbar"]');
    for (const toolbar of toolbars) {
        // Check if this toolbar contains a Send button or draft actions
        if (toolbar.querySelector('[aria-label*="Send"], [data-tooltip*="Send"]')) {
            return toolbar;
        }
    }
    
    // Fallback to other selectors
    const toolbarSelectors = ['.btC', '.aDh', '.gU.Up'];
    for (const selector of toolbarSelectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) {
            return toolbar;
        }
    }
    return null;
}

function getEmailContent() {
    const selectors = ['.h7',
         '.a3s.aiL', 
         '[role="presentation"]',
        '.gmail_quote'];
    for (const selector of selectors) {
        const content = document.querySelector(selector);
        if (content) {
            return content.innerText.trim();
        }
    }
    return '';
}

function injectButton() {
    const existingButton = document.querySelector('.email-writer-button');
    const existingDropdown = document.querySelector('.email-writer-tone-dropdown');
    if(existingButton) {existingButton.remove();}
    if(existingDropdown) {existingDropdown.remove();}
    const toolbar = findToolbar();
    if(!toolbar) {
        console.log("Toolbar not found");
        return;
    }
    console.log("Toolbar found, injecting button and dropdown");
    const dropdown = createToneDropdown();
    const button = createButton();
    button.classList.add('email-writer-button');
    button.addEventListener('click',async () => {
        try{
            button.innerHTML = 'Writing...';
            button.disabled = true;

            const emailContent = getEmailContent();
            const response = await fetch('http://localhost:8080/api/email/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                    {content:emailContent,
                    tone: selectedTone,}
                )
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.text();
            console.log('Generated email:', data);
            const composeBox = document.querySelector(
            '[role="textbox"][g_editable="true"]'
        );
        if(composeBox){
            composeBox.focus();
            document.execCommand('selectAll', false, null);
            document.execCommand('delete', false, null);
            document.execCommand('insertText', false, data);
        }else{
            console.error('Compose box not found');
        }
        }
        catch(error){
            console.error('Error generating email:', error);
            alert('Failed to generate email. Please try again.');
        }finally{
            button.innerHTML = 'AI Write';
            button.disabled = false;
        }
        
    });
    toolbar.insertBefore(dropdown, toolbar.firstChild);
    toolbar.insertBefore(button, toolbar.firstChild);
}

const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        const addedNodes = Array.from(mutation.addedNodes);
        const composedNodes = addedNodes.some(node => {
            if (node.nodeType !== Node.ELEMENT_NODE) return false;
            
            // Check if the node itself matches the selectors
            const isCompose = node.matches('.aDh, .btC, [role="dialog"]');
            
            // OR check if the node contains a child matching the selectors
            const hasCompose = node.querySelector && node.querySelector('.aDh, .btC, [role="dialog"]');
            
            return isCompose || !!hasCompose;
        });
        
        if (composedNodes) {
            console.log("Compose window detected");
            setTimeout(injectButton, 1000);
        }
    });
});

observer.observe(document.body, { childList: true, subtree: true });