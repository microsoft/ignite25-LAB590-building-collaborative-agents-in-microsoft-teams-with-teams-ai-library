import {
    AdaptiveCard,
    ChoiceSetInput,
    Container,
    Fact,
    FactSet,
    SubmitAction,
    TaskFetchAction,
    TextBlock,
    TextInput,
} from '@microsoft/teams.cards'
import { LaptopOrder } from './interfaces';

/**
 * Generates a premium order confirmation card with complete details
 */
function generateSubmittedLaptopOrderCard(currOrder: LaptopOrder): any {
    const card = new AdaptiveCard();
    card.version = '1.5';
    
    // Success celebration header
    const headerContainer = new Container();
    headerContainer.style = 'good';
    headerContainer.items = [
        new TextBlock('🎉 Order Submitted!', { 
            size: 'Large', 
            weight: 'Bolder', 
            color: 'Default',
            horizontalAlignment: 'Center',
            spacing: 'Medium'
        }),
        new TextBlock('Your laptop purchase order has been submitted for approval', {
            horizontalAlignment: 'Center',
            color: 'Default',
            spacing: 'Small'
        })
    ];
    
    // Professional order summary using FactSet
    const detailsContainer = new Container();
    detailsContainer.spacing = 'Large';
    detailsContainer.items = [
        new TextBlock('📋 Order Summary', { 
            size: 'Medium', 
            weight: 'Bolder', 
            spacing: 'Medium',
            color: 'Default'
        })
    ];

    const factSet = new FactSet();
    factSet.facts = [
        new Fact('🎫 Order ID', currOrder.id || 'Generating...'),
        new Fact('👤 Employee', currOrder.employee?.name || 'Unknown'),
        new Fact('🏢 Department', currOrder.employee?.department || 'Unknown'),
        new Fact('🔧 Request Type', currOrder.requestType),
        new Fact('💻 Selected Laptop', currOrder.selectedLaptop),
        new Fact('💰 Total Cost', currOrder.totalCost ? `$${currOrder.totalCost.toLocaleString()}` : 'TBD'),
        new Fact('📅 Order Date', currOrder.orderDate || new Date().toLocaleDateString()),
        new Fact('📦 Delivery', currOrder.deliveryDate),
        new Fact('✅ Status', currOrder.status.toUpperCase())
    ];
    
    // Add approval-specific information if available
    if (currOrder.trackingNumber) {
        factSet.facts.push(new Fact('🚚 Tracking Number', currOrder.trackingNumber));
    }
    if (currOrder.finalAmount) {
        factSet.facts.push(new Fact('💳 Final Amount', `$${currOrder.finalAmount.toLocaleString()}`));
    }
    factSet.spacing = 'Medium';
    
    detailsContainer.items.push(factSet);
    
    // Premium footer with order reference
    const footerContainer = new Container();
    footerContainer.spacing = 'Large';
    footerContainer.style = 'emphasis';
    
    const footerMessage = currOrder.status === 'approved' 
        ? 'Your order has been approved and will be processed immediately! 🎉'
        : 'Your order will be processed by IT procurement! 💻✨';
    
    footerContainer.items = [
        new TextBlock(`📝 Reference: ${currOrder.id || 'TBD'}`, { 
            horizontalAlignment: 'Center',
            weight: 'Bolder',
            color: 'Default',
            size: 'Medium'
        }),
        new TextBlock(footerMessage, { 
            horizontalAlignment: 'Center',
            color: 'Default',
            spacing: 'Small'
        })
    ];
    
    card.body = [headerContainer, detailsContainer, footerContainer];

    return {
        type: 'message',
        attachments: [
            {
                contentType: 'application/vnd.microsoft.card.adaptive',
                content: card,
            },
        ],
    };
}


/**
 * Generates a premium laptop ordering dialog with enhanced user experience
 */
function generateLaptopOrderDialogCard(currOrder: LaptopOrder): AdaptiveCard {
    const card = new AdaptiveCard();
    card.version = '1.5';
    
    // Premium header
    const headerContainer = new Container();
    headerContainer.style = 'accent';
    headerContainer.items = [
        new TextBlock('💻 Complete Your Laptop Order', { 
            size: 'Large', 
            weight: 'Bolder', 
            color: 'Default',
            horizontalAlignment: 'Center',
            spacing: 'Medium'
        })
    ];
    
    // Organized form sections
    const formContainer = new Container();
    formContainer.spacing = 'Large';
    
    // Personal information section
    const personalSection = new Container();
    personalSection.items = [
        new TextBlock('👤 Employee Information', { 
            weight: 'Bolder',
            size: 'Medium',
            spacing: 'Medium',
            color: 'Default'
        }),
        new TextBlock('Please provide your full name:', {
            spacing: 'Small',
            color: 'Default',
            wrap: true
        })
    ];
    
    const nameInput = new TextInput();
    nameInput.id = 'employeeNameInput';
    nameInput.placeholder = 'Full Name (e.g., John Smith)';
    nameInput.style = 'Text';
    personalSection.items.push(nameInput);

    // Department input
    personalSection.items.push(new TextBlock('Department:', {
        spacing: 'Medium',
        color: 'Default',
        wrap: true
    }));

    const departmentInput = new TextInput();
    departmentInput.id = 'departmentInput';
    departmentInput.placeholder = 'Department (e.g., Engineering, Sales, Marketing)';
    departmentInput.style = 'Text';
    personalSection.items.push(departmentInput);
    
    // Laptop selection section
    const laptopSection = new Container();
    laptopSection.spacing = 'Large';
    laptopSection.items = [
        new TextBlock('💻 Laptop Selection', { 
            weight: 'Bolder',
            size: 'Medium',
            spacing: 'Medium',
            color: 'Default'
        }),
        new TextBlock('Select your preferred laptop configuration:', {
            spacing: 'Small',
            color: 'Default',
            wrap: true
        })
    ];

    const laptopChoices = currOrder.availableLaptops.map(laptop => ({
        title: `💻 ${laptop.brand[0].name} ${laptop.model} - ${laptop.category} ($${laptop.price.toLocaleString()})`,
        value: `${laptop.brand[0].name} ${laptop.model} - ${laptop.processor}, ${laptop.ram}, ${laptop.storage}`,
    }));

    const laptopInput = new ChoiceSetInput();
    laptopInput.id = 'selectedLaptop';
    laptopInput.style = 'expanded';
    laptopInput.placeholder = 'Choose your preferred laptop';
    laptopInput.choices = laptopChoices.map(choice => ({ 
        title: choice.title, 
        value: choice.value 
    }));
    
    laptopSection.items.push(laptopInput);
    
    formContainer.items = [personalSection, laptopSection];
    
    // Premium call-to-action footer
    const footerContainer = new Container();
    footerContainer.spacing = 'Large';
    footerContainer.style = 'emphasis';
    footerContainer.items = [
        new TextBlock('Ready to submit your laptop order for approval? 🎯', { 
            horizontalAlignment: 'Center',
            color: 'Default',
            weight: 'Bolder'
        })
    ];
    
    card.body = [headerContainer, formContainer, footerContainer];

    card.actions = [new SubmitAction().withTitle('🚀 Submit Purchase Order').withId('completeOrder')];

    return card;
}

/**
 * Generates a card to collect business justification and request type from user
 */
function generateLaptopRequestCard(): any {
    const card = new AdaptiveCard();
    card.version = '1.5';
    
    // Premium header
    const headerContainer = new Container();
    headerContainer.style = 'emphasis';
    headerContainer.items = [
        new TextBlock('💻 New Laptop Request', { 
            size: 'Large', 
            weight: 'Bolder', 
            color: 'Default',
            horizontalAlignment: 'Center',
            spacing: 'Medium'
        }),
        new TextBlock('Please provide details about your laptop request', {
            horizontalAlignment: 'Center',
            color: 'Default',
            spacing: 'Small'
        })
    ];
    
    // Form container
    const formContainer = new Container();
    formContainer.spacing = 'Large';
    
    // Request type section
    const requestTypeSection = new Container();
    requestTypeSection.items = [
        new TextBlock('🔧 Request Type', { 
            weight: 'Bolder',
            size: 'Medium',
            spacing: 'Medium',
            color: 'Default'
        }),
        new TextBlock('What type of laptop request is this?', {
            spacing: 'Small',
            color: 'Default',
            wrap: true
        })
    ];
    
    const requestTypeInput = new ChoiceSetInput();
    requestTypeInput.id = 'requestTypeInput';
    requestTypeInput.style = 'expanded';
    requestTypeInput.placeholder = 'Select request type';
    requestTypeInput.choices = [
        { title: '👤 New Employee Setup - Setting up a laptop for a new team member', value: 'New Employee Setup' },
        { title: '🔄 Hardware Replacement - Replacing a damaged or obsolete laptop', value: 'Hardware Replacement' },
        { title: '⬆️ Upgrade Request - Upgrading current laptop for better performance', value: 'Upgrade Request' }
    ];
    
    requestTypeSection.items.push(requestTypeInput);
    
    // Business justification section
    const justificationSection = new Container();
    justificationSection.spacing = 'Large';
    justificationSection.items = [
        new TextBlock('📝 Business Justification', { 
            weight: 'Bolder',
            size: 'Medium',
            spacing: 'Medium',
            color: 'Default'
        }),
        new TextBlock('Please explain why you need this laptop. Any reason is fine - just help us understand your needs:', {
            spacing: 'Small',
            color: 'Default',
            wrap: true
        })
    ];
    
    const justificationInput = new TextInput();
    justificationInput.id = 'justificationInput';
    justificationInput.placeholder = 'Example: My current laptop is slow and crashes frequently, affecting my work productivity...';
    justificationInput.style = 'Text';
    justificationInput.isMultiline = true;
    justificationInput.maxLength = 500;
    
    justificationSection.items.push(justificationInput);
    
    formContainer.items = [requestTypeSection, justificationSection];
    
    // Footer with call to action
    const footerContainer = new Container();
    footerContainer.spacing = 'Large';
    footerContainer.style = 'accent';
    footerContainer.items = [
        new TextBlock('Ready to proceed with your laptop request? 🚀', {
            horizontalAlignment: 'Center',
            color: 'Default',
            weight: 'Bolder'
        })
    ];
    
    card.body = [headerContainer, formContainer, footerContainer];
    card.actions = [new SubmitAction().withTitle('📋 Submit Request').withId('submitLaptopRequest')];

    return {
        type: 'message',
        attachments: [
            {
                contentType: 'application/vnd.microsoft.card.adaptive',
                content: card,
            },
        ],
    };
}

/**
 * Generates a confirmation card after business justification is submitted
 */
function generateRequestConfirmationCard(requestType: string, justification: string): any {
    const card = new AdaptiveCard();
    card.version = '1.5';
    
    // Success header
    const headerContainer = new Container();
    headerContainer.style = 'good';
    headerContainer.items = [
        new TextBlock('✅ Request Created Successfully!', { 
            size: 'Large', 
            weight: 'Bolder', 
            color: 'Default',
            horizontalAlignment: 'Center',
            spacing: 'Medium'
        }),
        new TextBlock('Your laptop request has been initialized', {
            horizontalAlignment: 'Center',
            color: 'Default',
            spacing: 'Small'
        })
    ];
    
    // Request details
    const detailsContainer = new Container();
    detailsContainer.spacing = 'Large';
    detailsContainer.items = [
        new TextBlock('📋 Request Details', { 
            size: 'Medium', 
            weight: 'Bolder', 
            spacing: 'Medium',
            color: 'Default'
        }),
        new TextBlock(`🔧 **Request Type:** ${requestType}`, {
            weight: 'Bolder',
            spacing: 'Small',
            wrap: true
        }),
        new TextBlock(`📝 **Business Justification:** ${justification}`, {
            spacing: 'Small',
            wrap: true
        })
    ];
    
    // Next steps
    const nextStepsContainer = new Container();
    nextStepsContainer.spacing = 'Large';
    nextStepsContainer.style = 'accent';
    nextStepsContainer.items = [
        new TextBlock('🚀 Ready to select your laptop configuration?', {
            horizontalAlignment: 'Center',
            color: 'Default',
            weight: 'Bolder'
        })
    ];
    
    card.body = [headerContainer, detailsContainer, nextStepsContainer];
    card.actions = [new TaskFetchAction().withTitle('💻 Choose Laptop Configuration').withId('proceedToOrderButton')];

    return {
        type: 'message',
        attachments: [
            {
                contentType: 'application/vnd.microsoft.card.adaptive',
                content: card,
            },
        ],
    };
}

export { generateLaptopOrderDialogCard, generateSubmittedLaptopOrderCard, generateLaptopRequestCard, generateRequestConfirmationCard };