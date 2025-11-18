import { App } from '@microsoft/teams.apps';
import { ChatPrompt } from '@microsoft/teams.ai';
import { AzureOpenAIChatModelOptions, OpenAIChatModel } from '@microsoft/teams.openai';
import { ConsoleLogger, LocalStorage } from '@microsoft/teams.common';
import { InvokeResponse, TaskModuleResponse, TokenCredentials } from '@microsoft/teams.api';
import { StorageState, LaptopOrder } from './interfaces';
import { generateLaptopOrderDialogCard, generateSubmittedLaptopOrderCard, generateLaptopRequestCard, generateRequestConfirmationCard } from './cards';
import { getLaptopOptions, getLaptopRecommendations, searchLaptops } from './storage';
import { generateWelcomeCard } from './welcomeCard';
import { ManagedIdentityCredential } from '@azure/identity';
import * as fs from 'fs';
import * as path from 'path';
import config from "../config";
//ADD MCP IMPORT STATEMENT HERE

//Storage for current order and completed orders
const storage = new LocalStorage<StorageState>();

// Load instructions from file on initialization
function loadInstructions(): string {
  const instructionsFilePath = path.join(__dirname, "instructions.txt");
  return fs.readFileSync(instructionsFilePath, 'utf-8').trim();
}

// Initialize storage only if it doesn't exist to preserve order state
if (!storage.get('local')) {
    storage.set('local', { 
        currTicket: null,
        completedOrders: []
    } as StorageState);
}

const createTokenFactory = () => {
  return async (scope: string | string[], tenantId?: string): Promise<string> => {
    const managedIdentityCredential = new ManagedIdentityCredential({
        clientId: process.env.CLIENT_ID
      });
    const scopes = Array.isArray(scope) ? scope : [scope];
    const tokenResponse = await managedIdentityCredential.getToken(scopes, {
      tenantId: tenantId
    });
   
    return tokenResponse.token;
  };
};

// Configure authentication using TokenCredentials
const tokenCredentials: TokenCredentials = {
  clientId: process.env.CLIENT_ID || '',
  token: createTokenFactory()
};

const credentialOptions = config.MicrosoftAppType === "UserAssignedMsi" ? { ...tokenCredentials } : undefined;

const app = new App({
    ...credentialOptions,
    logger: new ConsoleLogger('@samples/echo', { level: 'debug' }),
});

//Handle different dialog types
app.on('dialog.open', async ({ activity }) => {
    const actionId = activity.value?.data?.id;
    
    if (actionId === 'createLaptopRequest') {
        // Show the laptop request form (business justification + request type)
        const requestCard = generateLaptopRequestCard();
        return {
            task: {
                type: 'continue',
                value: {
                    card: {
                        contentType: 'application/vnd.microsoft.card.adaptive',
                        content: requestCard.attachments[0].content,
                    },
                },
            },
        } as TaskModuleResponse;
    } else {
        // Show the laptop ordering form (existing behavior)
        const order = storage.get('local')!.currTicket;
        if (!order) {
            return {
                task: {
                    type: 'message',
                    value: 'No active laptop order found. Please start a new laptop order request first.',
                },
            } as TaskModuleResponse;
        }
        
        const dialogCard = generateLaptopOrderDialogCard(order);
        return {
            task: {
                type: 'continue',
                value: {
                    card: {
                        contentType: 'application/vnd.microsoft.card.adaptive',
                        content: dialogCard,
                    },
                    RequestType: order.requestType,
                    Laptops: order.availableLaptops,
                },
            },
        } as TaskModuleResponse;
    }
});

// What happens after the user submits either the laptop request or laptop order
app.on('dialog.submit', async ({ activity, send }) => {
    const data = activity.value!.data;
    
    // This handles laptop order submission (from the laptop configuration dialog)
    // The laptop request submission is now handled in the message handler
    const employeeName = data.employeeNameInput;
    const department = data.departmentInput;
    const selectedLaptop = data.selectedLaptop;
    const state = storage.get('local');
    const order = state!.currTicket;
    
    if (!order) {
        await send('Error: No active laptop order found. Please start a new laptop order request first.');
        return {
            status: 400,
            body: {
                task: {
                    type: 'message',
                    value: 'No active order to submit.',
                },
            },
        } as InvokeResponse<'task/submit'>;
    }
        
    
    // Find the selected laptop to get pricing
    const selectedLaptopOption = order.availableLaptops.find(laptop => 
        selectedLaptop.includes(laptop.brand[0].name) && selectedLaptop.includes(laptop.model)
    );
    
    // Update the order with user selections
    const completedOrder: LaptopOrder = {
        ...order,
        id: `PO-${Date.now()}`,
        employee: { name: employeeName, department: department },
        selectedLaptop: selectedLaptop,
        totalCost: selectedLaptopOption?.price || 0,
        status: "submitted" as const,
        orderDate: new Date().toLocaleDateString()
    };

    // Add completed order to the array
    state!.completedOrders.push(completedOrder);
    
    // Reset current order to null
    state!.currTicket = null;

    // Save the updated state to storage
    storage.set('local', state!);

    const updatedCard = generateSubmittedLaptopOrderCard(completedOrder);
    await send(updatedCard);

    return {
        status: 200,
        body: {
            task: {
                type: 'message',
                value: 'Your laptop order has been submitted successfully!',
            },
        },
    } as InvokeResponse<'task/submit'>;
});app.on('message', async ({ send, activity }) => {
    await send({ type: 'typing' });
    
    // Handle form submissions from message cards
    if (activity.value && (activity.value.requestTypeInput || activity.value.data)) {
        const data = activity.value;
        
        // Check if this is a laptop request submission (business justification form)
        if (data.requestTypeInput && data.justificationInput) {
            const requestType = data.requestTypeInput;
            const justification = data.justificationInput;
            
            if (!requestType || !justification) {
                await send('Please fill in both the request type and business justification.');
                return;
            }
            
            // Create the laptop order with user input using RAG service
            const state = storage.get('local');
            if (state) {
                try {
                    const laptopOptions = await getLaptopOptions();
                    
                    state.currTicket = {
                        requestType: requestType as "New Employee Setup" | "Hardware Replacement" | "Upgrade Request",
                        businessJustification: justification,
                        availableLaptops: laptopOptions,
                        selectedLaptop: 'TBD',
                        deliveryDate: 'Within 5-7 business days after approval',
                        status: 'pending'
                    };
                    storage.set('local', state);
                    
                    // Show the confirmation card
                    const confirmationCard = generateRequestConfirmationCard(requestType, justification);
                    await send(confirmationCard);
                    
                    await send(`Great! I've created your ${requestType.toLowerCase()} request. Click the button above to choose your laptop configuration.`);
                } catch (error) {
                    await send('There was an error creating your laptop request. Please try again.');
                }
            }
            return;
        }
    }
    
    // Handle button clicks from welcome card
    if (activity.value && activity.value.action) {
        const action = activity.value.action;
        
        if (action === 'createLaptopRequest') {
            // Show the laptop request form directly
            const requestCard = generateLaptopRequestCard();
            await send(requestCard);
            return;
        }
        
        if (action === 'viewOrders') {
            // Show user's orders
            const state = storage.get('local');
            const orders = state?.completedOrders || [];
            
            if (orders.length === 0) {
                await send('You have no orders yet. Would you like to create a new laptop request?');
            } else {
                let orderSummary = `📋 Your Laptop Orders (${orders.length} total):\n\n`;
                orders.forEach((order, index) => {
                    orderSummary += `${index + 1}. ${order.id}\n`;
                    orderSummary += `👤 Employee: ${order.employee?.name || 'Unknown'}\n`;
                    orderSummary += `🏢 Department: ${order.employee?.department || 'Unknown'}\n`;
                    orderSummary += `🔧 Request Type: ${order.requestType}\n`;
                    orderSummary += `💻 Laptop: ${order.selectedLaptop}\n`;
                    orderSummary += `💰 Cost: $${order.totalCost?.toLocaleString() || 'TBD'}\n`;
                    orderSummary += `📅 Order Date: ${order.orderDate}\n`;
                    orderSummary += `✅ Status: ${order.status}\n\n`;
                });
                await send(orderSummary);
            }
            return;
        }
    }
    
    // Ensure activity.text exists and is not null/undefined
    const messageText = activity.text || '';
    
    // Check if this is the first interaction or a greeting
    const isGreeting = messageText.toLowerCase().includes('hello') || 
                      messageText.toLowerCase().includes('hi') ||
                      messageText.toLowerCase().includes('hey') ||
                      messageText.toLowerCase().includes('start') ||
                      messageText.toLowerCase().includes('help') ||
                      messageText.trim() === '';
    
    if (isGreeting) {
        // Show welcome card with action buttons
        const welcomeCard = generateWelcomeCard();
        await send(welcomeCard);
        return;
    }
    
    const res = await prompt.send(messageText);
    await send(res.content!);
    
    // Check if we should show the laptop request card
    const stateAfter = storage.get('local');
    
    // Show laptop request card if AI mentions starting a new request OR if flag is set
    const showRequestCard = (res.content?.toLowerCase().includes('new laptop request') &&
                            res.content?.toLowerCase().includes('business justification') &&
                            !stateAfter?.currTicket) || // Legacy keyword matching
                            stateAfter?.showRequestCard; // New flag-based approach
    
    if (showRequestCard) {
        const requestCard = generateLaptopRequestCard();
        await send(requestCard);
        
        // Clear the flag after showing the card
        if (stateAfter?.showRequestCard) {
            stateAfter.showRequestCard = false;
            storage.set('local', stateAfter);
        }
    }
});

//ADD MCP LOGGER STATEMENT HERE
const prompt = new ChatPrompt(
    {
        instructions: [
            'You are a tech support assistant who provides general technical support to users with basic questions, help users solve technical issues with information you can find on the internet',
            'You can also help employees order new laptops. When users ask for a new laptop, simply call the generate_new_laptop_order function which will show them a form to fill out.',
            'When users ask about their existing orders, past purchases, or want to see what they have ordered, call the list_orders function.',
            'When users ask about new laptop requests, hardware needs, or if they need a new laptop, call the generate_new_laptop_order function. Do not ask them to provide business justification in a specific format - the form will collect that information.',
            'When users ask about laptop specifications, available models, or what laptops are available, call the get_laptop_options function.',
            'When users want personalized laptop recommendations based on their use case, budget, or performance needs, call the recommend_laptops function.',
            'Be friendly and helpful. Never ask users to format their requests in a specific way - always use the appropriate function to show them the right form or information.',
            'When users ask for a status update on their order, use the MCPclientplugin to send the price and date of the order to receieve approval or denial on the purchase. Do not by any means infer approval or denial of the purchase, you must always submit the order to the MCP server for processing.',
            'On startup you will greet users friendly and ask them if they have any technical issues you can help them with or if they need to order a new laptop.',
        ].join('\n'),
        model: new OpenAIChatModel({
            model: 'gpt-4o',
            apiKey: process.env.SECRET_AZURE_OPENAI_API_KEY,
            endpoint: process.env.AZURE_OPENAI_ENDPOINT,
            apiVersion: '2025-01-01-preview',
        } as AzureOpenAIChatModelOptions),
        
    },
) //REPLACE THIS ENTIRE LINE WITH MCP PLUGIN INITIALIZATION CODE

//ADD MCP PLUGIN USAGE HERE


 // gets a list of the available laptop options   
    .function('get_laptop_options', 'Returns a list of the available laptop options and configurations', async () => {
        try {
            const laptopOptions = await getLaptopOptions();
            
            let response = "## 💻 Available Laptop Options\n\n";
            laptopOptions.forEach((laptop, index) => {
                response += `**${index + 1}. ${laptop.brand[0].name} ${laptop.model}** - $${laptop.price.toLocaleString()}\n`;
                response += `• Category: ${laptop.category}\n`;
                response += `• Processor: ${laptop.processor}\n`;
                response += `• RAM: ${laptop.ram}\n`;
                response += `• Storage: ${laptop.storage}\n`;
                if (laptop.description) {
                    response += `• Description: ${laptop.description}\n`;
                }
                response += `\n`;
            });
            
            response += "\nTo get personalized recommendations, please tell me about your specific needs (e.g., 'I need a laptop for video editing' or 'Budget under $1500')";
            
            return response;
        } catch (error) {
            return "I'm having trouble retrieving laptop options right now. Please try again in a moment.";
        }
    })
    // Search laptops based on user requirements using RAG
    .function('search_laptops', 'Searches for laptops based on user requirements like budget, use case, or specific needs', async (searchQuery: string) => {
        try {
            const results = await searchLaptops(searchQuery);
            
            if (results.length === 0) {
                return "No laptops found matching your criteria. Please try a different search or ask about our available options.";
            }
            
            let response = `## 🔍 Search Results for: "${searchQuery}"\n\n`;
            results.forEach((laptop, index) => {
                response += `### ${index + 1}. ${laptop.brand[0].name} ${laptop.model} - $${laptop.price.toLocaleString()}\n`;
                response += `**Category:** ${laptop.category}\n`;
                response += `**Specs:** ${laptop.processor} | ${laptop.ram} | ${laptop.storage}\n`;
                if (laptop.description) {
                    response += `**Description:** ${laptop.description}\n`;
                }
                response += `\n`;
            });
            
            return response;
        } catch (error) {
            return "I'm having trouble searching laptops right now. Please try again in a moment.";
        }
    })
    // Get laptop recommendations based on specific requirements
    .function('recommend_laptops', 'Provides laptop recommendations based on specific requirements like budget, use case, performance needs', async (useCase?: string, budget?: number, performanceNeeds?: string) => {
        try {
            const requirements: any = {};
            if (useCase) requirements.useCase = useCase;
            if (budget) requirements.budget = budget;
            if (performanceNeeds && typeof performanceNeeds === 'string') {
                requirements.performanceNeeds = performanceNeeds.toLowerCase() as 'low' | 'medium' | 'high';
            }
            
            return await getLaptopRecommendations(requirements);
        } catch (error) {
            return "I'm having trouble generating recommendations right now. Please try again in a moment.";
        }
    })
    // Function to list all completed orders
    .function('list_orders', 'Lists all completed laptop orders for the user. Call this when user asks about their orders, purchase history, or wants to see what they have ordered.', () => {
        const state = storage.get('local');
        const orders = state?.completedOrders || [];
        
        if (orders.length === 0) {
            return 'You have no completed orders yet.';
        }
        
        // Create a summary of all orders
        let orderSummary = `📋 Your Laptop Orders (${orders.length} total):\n\n`;
        orders.forEach((order, index) => {
            orderSummary += `${index + 1}. ${order.id}\n`;
            orderSummary += `👤 Employee: ${order.employee?.name || 'Unknown'}\n`;
            orderSummary += `🏢 Department: ${order.employee?.department || 'Unknown'}\n`;
            orderSummary += `� Request Type: ${order.requestType}\n`;
            orderSummary += `💻 Laptop: ${order.selectedLaptop}\n`;
            orderSummary += `� Cost: $${order.totalCost?.toLocaleString() || 'TBD'}\n`;
            orderSummary += `� Order Date: ${order.orderDate}\n`;
            orderSummary += `✅ Status: ${order.status}\n\n`;
        });
        
        return orderSummary;
    })
    // Function to generate new laptop order
    .function('generate_new_laptop_order', 'Shows a form for users to request a new laptop. Call this when user asks about new laptops, hardware requests, or if they need a new laptop. The form will collect business justification and request type.', () => {
        // Set a flag in storage to indicate we should show the request card
        const state = storage.get('local');
        if (state) {
            state.showRequestCard = true;
            storage.set('local', state);
        }
        return `💻 I'll help you request a new laptop! A form will appear where you can provide your business justification and select the type of request.`;
    });

export default app;