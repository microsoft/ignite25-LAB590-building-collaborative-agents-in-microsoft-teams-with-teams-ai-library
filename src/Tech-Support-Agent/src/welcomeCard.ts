import {
    AdaptiveCard,
    Container,
    TextBlock,
    SubmitAction
} from '@microsoft/teams.cards'

/**
 * Generates a welcome card with direct action buttons
 */
export function generateWelcomeCard(): any {
    const card = new AdaptiveCard();
    card.version = '1.5';
    
    // Header
    const headerContainer = new Container();
    headerContainer.style = 'emphasis';
    headerContainer.items = [
        new TextBlock('🖥️ Contoso Tech Support Agent', { 
            size: 'Large', 
            weight: 'Bolder', 
            color: 'Default',
            horizontalAlignment: 'Center',
            spacing: 'Medium'
        }),
        new TextBlock('How can I assist you today?', {
            horizontalAlignment: 'Center',
            color: 'Default',
            spacing: 'Small'
        })
    ];
    
    // Options
    const optionsContainer = new Container();
    optionsContainer.spacing = 'Large';
    optionsContainer.items = [
        new TextBlock('Ask a question in chat or use the buttons below:', { 
            weight: 'Bolder',
            size: 'Medium',
            spacing: 'Medium',
            color: 'Default'
        }),
    ];
    
    card.body = [headerContainer, optionsContainer];
    card.actions = [
        new SubmitAction().withTitle('💻 Create Laptop Request').withData({ action: 'createLaptopRequest' }),
        new SubmitAction().withTitle('📋 View My Orders').withData({ action: 'viewOrders' })
    ];

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