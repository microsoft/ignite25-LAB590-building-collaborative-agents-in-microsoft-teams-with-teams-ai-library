
@lab.Title

---
# Create Your First Agent
>  **Teams AI Library** is designed to enhance developer experience with streamlined integrations and accelerated workflows. 

---
## Lab Overview
This lab will help you:

- Create an Agent in 30 seconds using CLI.
- Run code and see Teams and AI integrations.
- Test your agent with DevTools and Microsoft Teams.
- Integreate with advanced orchestration tools like MCP
- Launch and deploy an Azure OpenAI Foundry Model and use it to power your agent

---
## Lab Breakdown
This lab is divided into 4 sections:
- Part 1 > Build your Agent in 30 Seconds
- Part 2 > Explore DevTools
- Part 3 > AI Foundry Resources Setup
- Part 4 > Connect Tech Support agent to Foundry Resources
- PArt 5 > Add advanced orchestration with MCP

---
**Please proceed to the next section.** (Navigation aids are at bottom right)

---
>[!note] This lab is written in Typescript. No prior knowledge is needed. Teams AI Library is also available in .NET and Python. 

>[!help]**If you are stuck in any part of the lab please ask a proctor for help.** 

===

## Exercise 1: Build Your Agent in 30 Seconds

First, we will use the Teams CLI to build a simple Echo Bot.

In this first part, you'll learn the basics of creating an application, understanding its structure, and running it locally. By the end, you'll have a solid foundation to build upon as you explore more advanced features and capabilities of the SDK.


1. [] Login with the following **Password**: +++@lab.VirtualMachine(Win11-Pro-Base).Password+++

2. [] **Left** click **twice** on **Visual Studio Code**. 

> [!knowledge] The Teams CLI is a command-line tool that helps you create, manage, and deploy Teams applications. It provides a set of commands to simplify the development process. 

3. [] Open the terminal and install the **Teams CLI** globally using npm
```
npm install -g @microsoft/teams.cli
```
4. [] Next, run this command to create your agent. This is a basic agent that repeats back any message it receives.

```
teams new ts quote-agent --template echo
```
Notice that this command:
- Creates a new directory called **quote-agent**.
- Bootstraps the echo agent template files into it under **quote-agent/src**. 
- Creates your agent's manifest files, including a **manifest.json** file and placeholder icons in the **quote-agent/appPackage** directory. The Teams app manifest is required for sideloading the app into Teams.

---

5. [] Navigate to your agent's directory
```
cd quote-agent
```
6. [] Install the dependencies
```
npm install
```

7. [] Start the development server
```
npm run dev
```

> [!alert] You may encounter Windows Defender Firewall pop-ups for Visual Studio Code and Node.JS. Click "Allow access".

Notice that when the application starts, you'll see:

- A http server starting up. (port 3000) (This is the main server which handles incoming requests and serves the agent application.)
- A devtools server starting up. (port 3001) This is a developer server that provides a web interface for debugging and testing your agent quickly, without having to deploy it to Teams.

---
Send the Agent a message:
8. [] Navigate to the devtools server by clicking the link from the console. 
You can do this by holding **Ctrl** on your keyboard and **clicking** with your mouse. You should see a simple interface where you can interact with your agent.

9. [] Send it a message and watch it echo back!

---
Congrats, you just made your agent in 30 seconds! :tada:

---
**Please proceed to the next section.** Keep the DevTools window open, we'll explore it in the next section.

===

## Exercise 2: Explore DevTools

> One of the main motivations for Teams AI Library is to provide excellent tools that simplify and speed up building and testing agents. Because of this, we created the CLI for speedy agent initiation and project management, and DevTools as an accessible way to test your agent's behavior without jumping through deployment hoops. DevTools also provides crucial insight on activity payloads on the Activities page.

> [!knowledge] The developer tools can be used to locally interact with an app to streamline the testing/development process, preventing you from needing to deploy/register the app or expose a public endpoint.

---
### Chat Capabilities
Let's start by examining the chat. 

> The chat window emulates Teams features as closely as possible. Not all Teams features are available in DevTools, but we are working to add more features over time.
1. [] Send a message in the **compose box**. The agent should echo back.
2. [] **Hover** over the agent's message to react to the message.
3. [] Hover over your own message. Edit your message by selecting the **Edit** (pencil) icon from the message actions menu. Press **Enter** or the checkmark button to send the edited message, or the **Dismiss** (X) button to cancel.
4. [] Hover over your own message. Soft delete your message by pressing the **More** (ellipsis) button, then the **Delete** (trash) button. Click "**Undo**" to restore the message.
5. [] Check your **app connectivity** - the DevTools banner shows a green badge or 'Connected' text when connected, and red or 'Disconnected' when not.
6. [] Next, hover over the **search icon**, and let's examine the activity. Click the button.

---
### Inspect Activities
1. [] Select an activity in the left grid, this opens a detailed view in Preview mode, showing the full payload as a tree with expandable and collapsible sections.
2. [ ] Toggle from "**Preview**" to "**JSON**" under the "Activity details" header to see the raw JSON payload.
3. [ ] Press the Copy button in the top left corner of the Activity details view to copy the payload to your clipboard.
4. [ ] To reset the filter on this specific activity ID, use the filter button in the "Type" column header and de-select the activity ID to show all activities again.

---

Awesome, now that you're warmed up with our tools, let's dive into our agent.
1. [] Close the DevTools browser, and make sure to kill the terminal by clicking on the trash button before proceeding to the next exercise.

---
Go ahead and close DevTools and close your Visual Studio Code window.

**Please proceed to the next section.** (Navigation aids are at bottom right)
===

## Exercise 3: AI Foundry Resource Setup

For today, we're going to be working with our **Tech Support Agent**.

> The Tech Support Agent helps employees answer general tech-related questions and more importantly, help users order new laptops. Like most agents, intelligence is key here. The agent can recommend certain laptops based on user needs and help you place an order for a laptop all using conversational based AI. This example uses a RAG service to store laptop information and uses that to help guide and place orders for users. 

>[!knowledge] The Tech Support agent is built with the Teams AI Library and shows how easy it is to use activity handlers, dialogs, adaptive cards, and AI to create a fun, interactive agent with just a few building blocks.

### Step 1: Get your Azure AI Foundry Keys

---
1. [] Open the Microsoft Edge from the desktop, copy and paste the link to navigate to +++https://ai.azure.com/resources+++. Make sure this opens **inside** of your VM.

2. [] You will be requested to sign in. Open this lab's **Resources** tab, and sign in with the provided **Username** and **Tap (Temporary Access Pass)**.
> [!warning] If you are stuck in a sign in loop, try reopening the link. 

---
3. [] Upon successful login, you should see this page. Select **Create new**, then select **Azure AI Foundry resource** and select **Next**

!IMAGE[IMG8082.png](instructions310568/IMG8082.png)

---
4. [] You can name your project anything you like, just remember we will have to use this name later. Click **Create**
5. [] You should now see a screen similar to this, deployment of your resources will take a few minutes. 

!IMAGE[img8000.png](instructions310568/img8000.png)

### Step 2: Launch Teams in Edge

1. [] While we wait, let's launch Teams for the first time in the browser, this will help speed things up later in the lab. Open a new tab in Edge and navigate to **teams.microsoft.com**
2. [] Select **Start trial**

### Step 3: Deploy gpt-4o

---
1. [] Your Azure AI Foundry resources should be up and running, head back to the Azure AI Foundry tab
2. [] In the left menu you should see a section called **My assets**, click on **Models + Endponts** 
3. [] Click on **Deploy Model**, and select **Deploy Base Model**
4. [] Choose **gpt-4o** and click **Confirm**, then **Deploy** Your deployment page should look like this: 

!IMAGE[deploy gpt-4o.png](instructions310568/deploy gpt-4o.png)
---
5. [] You should end up on a page like this, keep this page open and minimize the window, we will use this API key and endpoint later. 

!IMAGE[gpt-4o api key.png](instructions310568/gpt-4o api key.png)

6. [] You can close the Teams tab you opened earlier, check if any tool tips have come up and dismiss them first. Make sure to keep your Foundry tab open

---
**Please proceed to the next section.** 
===
## Exercise 4: Connect Tech Support agent to your Azure AI Foundry resource
In this section, we'll take the endpoint and key created in your Azure AI Foundry resource, and use it to power our Tech Support Agent

### Step 1: Add your resource keys

---
1. [] From the desktop, open **Visual Studio Code**.
2. [] In VS Code, select **File** and **Open folder**
3. [] Navigate to **C:/Users/LabUser/Ignite2025** and choose **Select Folder**
4. [] Feel free to look around the code, this is the pre-built tech-support agent. You can see the functionality in the **src** folder.
5. [] Open the **.env** file and set the values from your Azure AI Foundry Resource (Key, API Version) from Step 6 in the following way: 

> [!knowledge] Your API key is listed as "Key" on the Azure AI Foundry deployment page, your API version is listed at the end of the Target URI

The file should look something like this:git lo

```
PORT=3978 
CLIENT_ID=  
CLIENT_SECRET=  
AOI_KEY=*SECRET REDACTED*
AOI_MODEL=gpt-4o
AOI_API_VERSION=2024-12-01-previewgit 
```
> [!alert] Do not copy the code above into your project, these keys are placeholders and will not work

6. [] Next we need to add our URI to the project. In VS Code navigate to **index.ts**
7. [] Go to **Line 279** you should see a comment 'REPLACE ME WITH YOUR ENDPOINT / URI FROM FOUNDRY'
8. [] Copy your URI from Azure AI Foundry and replace the comment with the URI. Remember to include quotations since this is a string 

It should look something like this: 

!IMAGE[openAIEndpoint.png](instructions310568/openAIEndpoint.png)

### Step 2: Launch the Tech Support Agent in Teams

---

Now, let's start the agent and load it into Teams using the M365 Agent Toolkit extension.

M365 Agent Toolkit is a powerful tool that simplifies deploying and debugging Teams applications. It automates tasks like managing the Teams app manifest, configuring authentication, provisioning, and deployment.

---

1. [] Click the '**Run and Debug**' extension icon (fourth icon in the leftmost column). In the dropdown, select **"Debug (Edge)"**, or press **F5** on the keyboard.

!IMAGE[run and debug.png](instructions310568/run and debug.png)

This will kickstart the M365 Agent Toolkit process of provisioning the required Azure resources, starting the local bot web server, configuring the local tunnel, and loading the agent into the Teams environment.

> [!alert] You may encounter Windows Defender Firewall pop-ups for Visual Studio Code and Node.JS. Click "Allow access". 

2. [] First, you will be required by ATK to sign in with a Microsoft account.
3. [] Click "**Sign In**" and a web browser should open with the Microsoft login page. Use the previous credentials on the "**Resources**" tab. As you signed in earlier.

**Once complete, you can close the tab.**

4. [] In this step, another web browser will open, and you will be asked to provide Microsoft credentials again. Simply provide the same credentials.

5. [] Voila! Click to "**Add**" or "**Open**" the agent.

> [!alert] If this page does not open up for you call a proctor to help you

### Step 3: Interact with the Tech Support Agent

---
1. [] Start the conversation with a simple +++hello+++, you should receive an adaptive card asking you how the agent can help

>[!knowledge] Adaptive cards are great ways to engage users and help provide or collect information in an organized way

2. [] Click on **Create Laptop Request** and follow the prompts, they should be easy to follow, that's what the agent is for!
3. [] Make sure you **Submit Request** and **Choose Laptop Configuration**
4. [ ] You should end on an adpative card that looks like this: 

!IMAGE[ordersubmitted.png](instructions310568/ordersubmitted.png)

Your agent is up and running and is being powered by Azure AI Foundry resources! Congrats! :tada:

5. [] Before moving on to the next sessions, let's properly terminate our current debug session. Start by opening VS Code and clicking the disconnect button toward the top of the screen. 

!IMAGE[disconnect.png](instructions310568/disconnect.png)

6. [] Next, make sure you kill all open terminals, once done, head back to the explorer tab on the left side rail and continue to the next section

!IMAGE[killdelete.png](instructions310568/killdelete.png)

Let's dive a little deeper and add some MCP functionality. 

---

**Please proceed to the next section.** (Navigation aids are at bottom right)
===

## Exercise 5: Add Advanced Orchestration (MCP)

In this exercise we're going to position our tech support agent as an MCP client that utilizes an external resources to approve / deny purchase orders for laptops. This service will take in purchase order details and either:
1. Approve the claim and return a full purchase amount (The MSRP + 10% and 15$) and a tracking number
2. Deny the claim with reason
Let's add the MCP client code and see if we can get the agnent to approve or deny our claim. 

The MCP server has been pre-built and setup, in this case, much of the code you use would be the same, just with the URL of the MCP server you are using and your own MCP key. 

In part 8 of step #1, you will be able to see much of the logic and tools the MCP server has made available to the agent. Thes logs come from part 3 of step #1, adding a logger to the MCP client on our agent. 

### Step 1: Add an MCP Client

1. [] On the terminal, install the **MCP Client Package** via 
`npm i @microsoft/teams.mcpclient`

2. [] At the top of the **index.ts** file at **line 11** replace the comment this this import statement to import the library 
`import { McpClientPlugin } from '@microsoft/teams.mcpclient';`

3. [] At **line 262** just before the chatprompt, replace the comment with a new console logger so we can see the MCP in action later: 
```const logger = new ConsoleLogger('mcp-client', {level: 'debug'});```

3. [] Navigate to the **index.ts** file. Scroll to **Line 285**. In the **ChatPrompt** declaration, add 
``` [new McpClientPlugin({logger})],)``` 


4. [] At the end of the **ChatPrompt** on **line 287** replace the comment with the snip below.
```.usePlugin("mcpClient", {
url: process.env.MCP_ENDPOINT!,
   params: {
      headers: {
"x-functions-key": process.env.MCP_KEY!
      }
   }
})```

Your code should look something like this
!IMAGE[codesnipmcp.png](instructions310568/codesnipmcp.png)

5. [] Make sure to save all the files. Then, click the '**Run and Debug**' extension icon (fourth icon in the leftmost column). In the dropdown, select **"Debug (Edge)"**, or press **F5** on the keyboard.

> [!alert] You may be asked to terminate processes on ports to allow the debugger to run, click **Terminate**

6. [ ] Input a new laptop order, then ask the agent +++can you get an update on my order?+++
7. [ ] Your agent will call the MCP server with details about your order, and the MCP server will approve or deny. 
8. [ ] Check the logs in VS Code and you should see the MCP server tools being cached for use during conversation, like this: 

!IMAGE[cached tools.png](instructions310568/cached tools.png)

And just like that! You've sucessfully incorported MCP into your Tech Support Agent!

---
**Please proceed to the next section.** (Navigation aids are at bottom right)
===

## Takeaways & Next Steps

Congratulations on building your first agent with Teams AI Library!

In this lab we've accomplished the following:
1. Used the Teams CLI to build our own conversational agent in 30 seconds
2. Tested the agent by launching it directly on DevTools and Microsoft Teams
3. Learned and explored the power of integrating Teams DevTools, Teams AI Library, M365 Agent Toolkit, and Azure AI Foundry
4. Added AI Capabilities to our Tech Support Agent
5. Integreated an MCP client into our Tech Support agent
***

Want to learn more and keep building? Here are further resources to look at:
* [Teams AI Library Docs](https://microsoft.github.io/teams-ai/welcome/)
* [Teams AI Accelerator Templates](https://aka.ms/teams-templates-gallery)
* [Adaptive Cards](https://adaptivecards.microsoft.com/)

---
**Please proceed to the End.** (Navigation aids are at bottom right)



