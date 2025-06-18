document.addEventListener('DOMContentLoaded', () => {
    // #######################################################################
    // ### THE MOST IMPORTANT STEP: PASTE YOUR DIFY KEYS & URL HERE       ###
    // #######################################################################
    const difyApiKey = "app-AKLVrjLrC1BKIPl2rbL5hZJD";
    const difyApiEndpoint = "https://api.dify.ai/v1/chat-messages"; // This is usually the same for everyone
    // #######################################################################


    // --- Get all the HTML elements we need to work with ---
    const welcomePage = document.getElementById('welcome-page');
    const chatPage = document.getElementById('chat-page');
    const getStartedBtn = document.getElementById('get-started-btn');
    const langBtns = document.querySelectorAll('.lang-btn');
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const messageContainer = document.getElementById('message-container');
    const personaSelect = document.getElementById('persona-select');
    const messageTemplate = document.getElementById('message-template');
    const newChatBtn = document.getElementById('new-chat-btn');

    let currentLanguage = 'en';
    let conversationId = null; // To keep track of the conversation for Dify

    // --- All the text for both languages (no changes here) ---
    const translations = {
        en: { /* ... same as before ... */ },
        bn: { /* ... same as before ... */ }
    };
    // Note: To save space, I've omitted the full translations object. Use the one from the previous code.


    // --- Function to switch the UI language (no changes here) ---
    function switchLanguage(lang) { /* ... same as before ... */ }


    // --- Function to add a new message to the chat window (no changes here) ---
    function addMessage(content, isUser = false, isTyping = false) { /* ... same as before ... */ }


    // --- Function to handle form submission (UPDATED FOR DIFY) ---
    async function sendMessage(event) {
        event.preventDefault();
        const userMessage = messageInput.value.trim();
        if (!userMessage) return;

        addMessage(userMessage, true);
        messageInput.value = '';

        const typingIndicator = addMessage(translations[currentLanguage].typing, false, true);
        
        // Prepare the request for Dify's API
        const requestBody = {
            inputs: {
                "persona": personaSelect.value,
                "language": currentLanguage === 'en' ? 'English' : 'Bengali'
            },
            query: userMessage,
            response_mode: "streaming", // Or "blocking"
            user: "legal-ai-user-123", // A unique identifier for the user
        };

        // Add conversation_id if we have one from a previous message
        if (conversationId) {
            requestBody.conversation_id = conversationId;
        }

        try {
            const response = await fetch(difyApiEndpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${difyApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            messageContainer.removeChild(typingIndicator);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${response.status} - ${errorData.message || response.statusText}`);
            }

            // Dify's streaming response needs to be handled line by line
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiMessageDiv = addMessage("", false); // Create an empty bubble for the AI
            let fullResponse = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const jsonData = JSON.parse(line.substring(6));
                            if (jsonData.event === 'agent_message' || jsonData.event === 'message') {
                                fullResponse += jsonData.answer;
                                aiMessageDiv.querySelector('.text-content').textContent = fullResponse;
                                messageContainer.scrollTop = messageContainer.scrollHeight;
                            }
                            if (jsonData.event === 'message_end') {
                                conversationId = jsonData.conversation_id; // Save for next message
                            }
                        } catch (e) {
                            // Ignore non-JSON lines
                        }
                    }
                }
            }
            if (fullResponse.trim() === "") {
                aiMessageDiv.querySelector('.text-content').textContent = "I received an empty response. Please try again.";
            }

        } catch (error) {
            console.error("Error fetching from Dify:", error);
            if(typingIndicator && messageContainer.contains(typingIndicator)) {
                messageContainer.removeChild(typingIndicator);
            }
            addMessage(`Sorry, there was an error connecting to the AI: ${error.message}`, false);
        }
    }

    // --- Setup and Initialization (Copying the full functions from the previous version) ---
    // Make sure the full translation object is here.
    const fullTranslations = { en: { welcomeLogo: "LegalAI BD", welcomeTitle: "Your AI-Powered Bangladesh Legal Assistant", welcomeSubtitle: "Get simplified legal information, analyze laws, and understand your rights. Powered by live data from official sources.", getStartedBtn: "Get Started", welcomeDisclaimer: "This is a prototype for informational purposes. Consult a lawyer for legal advice.", chatLogo: "LegalAI BD", newChatBtn: "+ New Chat", conversationsTitle: "Your conversations", personaPublic: "I am: General Public", personaStudent: "I am: Law Student", personaLawyer: "I am: Lawyer", messagePlaceholder: "Ask about a legal situation or define a term...", chatDisclaimer: "This is a prototype. Not legal advice. AI can make mistakes.", typing: "typing..." }, bn: { welcomeLogo: "লিগ্যালএআই বিডি", welcomeTitle: "আপনার এআই-চালিত বাংলাদেশ আইন সহকারী", welcomeSubtitle: "সহজ ভাষায় আইনি তথ্য পান, আইন বিশ্লেষণ করুন এবং আপনার অধিকার জানুন। অফিসিয়াল উৎস থেকে লাইভ ডেটা দ্বারা চালিত।", getStartedBtn: "শুরু করুন", welcomeDisclaimer: "এটি শুধুমাত্র তথ্যগত উদ্দেশ্যে একটি প্রোটোটাইপ। আইনি পরামর্শের জন্য একজন আইনজীবীর সাথে পরামর্শ করুন।", chatLogo: "লিগ্যালএআই বিডি", newChatBtn: "+ নতুন চ্যাট", conversationsTitle: "আপনার কথোপকথন", personaPublic: "আমি: সাধারণ নাগরিক", personaStudent: "আমি: আইনের ছাত্র", personaLawyer: "আমি: আইনজীবী", messagePlaceholder: "কোনো আইনি পরিস্থিতি সম্পর্কে জিজ্ঞাসা করুন বা কোনো শব্দের সংজ্ঞা দিন...", chatDisclaimer: "এটি একটি প্রোটোটাইপ। আইনি পরামর্শ নয়। এআই ভুল করতে পারে।", typing: "টাইপ করছে..." } };
    Object.assign(translations, fullTranslations);
    
    // Switch Language Function
    function fullSwitchLanguage(lang) { currentLanguage = lang; const t = translations[lang]; document.getElementById('welcome-logo').textContent = t.welcomeLogo; document.getElementById('welcome-title').textContent = t.welcomeTitle; document.getElementById('welcome-subtitle').textContent = t.welcomeSubtitle; document.getElementById('get-started-btn').textContent = t.getStartedBtn; document.getElementById('welcome-disclaimer').textContent = t.welcomeDisclaimer; document.getElementById('chat-logo').textContent = t.chatLogo; document.getElementById('new-chat-btn').textContent = t.newChatBtn; document.getElementById('conversations-title').textContent = t.conversationsTitle; document.getElementById('persona-public').textContent = t.personaPublic; document.getElementById('persona-student').textContent = t.personaStudent; document.getElementById('persona-lawyer').textContent = t.personaLawyer; document.getElementById('message-input').placeholder = t.messagePlaceholder; document.getElementById('chat-disclaimer').textContent = t.chatDisclaimer; langBtns.forEach(btn => { btn.classList.remove('active'); if (btn.dataset.lang === lang) { btn.classList.add('active'); } }); }
    Object.assign(switchLanguage, fullSwitchLanguage);

    // Add Message Function
    function fullAddMessage(content, isUser = false, isTyping = false) { const messageClone = messageTemplate.content.cloneNode(true); const messageDiv = messageClone.querySelector('.message'); const textContentDiv = messageClone.querySelector('.text-content'); textContentDiv.textContent = content; if (isUser) { messageDiv.classList.add('user-message'); } else if (isTyping) { messageDiv.classList.add('typing-indicator'); } messageContainer.appendChild(messageClone); messageContainer.scrollTop = messageContainer.scrollHeight; return messageDiv; }
    Object.assign(addMessage, fullAddMessage);

    newChatBtn.addEventListener('click', () => {
        messageContainer.innerHTML = '';
        conversationId = null; // Reset the conversation
    });

    langBtns.forEach(btn => btn.addEventListener('click', () => switchLanguage(btn.dataset.lang)));
    getStartedBtn.addEventListener('click', () => { welcomePage.classList.remove('active'); chatPage.classList.add('active'); });
    chatForm.addEventListener('submit', sendMessage);
    switchLanguage('en');
});