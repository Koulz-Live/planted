"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSmartSuggestions = generateSmartSuggestions;
exports.refineOutput = refineOutput;
exports.answerFollowUpQuestion = answerFollowUpQuestion;
exports.generateChatResponse = generateChatResponse;
const openai_1 = __importDefault(require("openai"));
const zod_1 = require("zod");
const zod_2 = require("openai/helpers/zod");
const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey ? new openai_1.default({ apiKey: openaiApiKey }) : null;
// Schemas for smart suggestions
const PlantSuggestionSchema = zod_1.z.object({
    plantName: zod_1.z.string(),
    reason: zod_1.z.string(),
    companionPlants: zod_1.z.array(zod_1.z.string()).optional(),
    seasonalTiming: zod_1.z.string().optional()
});
const RecipeSuggestionSchema = zod_1.z.object({
    recipeName: zod_1.z.string(),
    reason: zod_1.z.string(),
    keyIngredients: zod_1.z.array(zod_1.z.string()),
    culturalOrigin: zod_1.z.string().optional()
});
const SmartSuggestionsSchema = zod_1.z.object({
    plantSuggestions: zod_1.z.array(PlantSuggestionSchema).describe('3-5 personalized plant recommendations'),
    recipeSuggestions: zod_1.z.array(RecipeSuggestionSchema).describe('3-5 recipe suggestions based on user patterns'),
    seasonalTips: zod_1.z.array(zod_1.z.string()).describe('Current seasonal advice for the user region'),
    biodiversityInsights: zod_1.z.array(zod_1.z.string()).describe('Biodiversity tips relevant to user context')
});
/**
 * Generate personalized smart suggestions based on user history and context
 */
async function generateSmartSuggestions(userContext, userId = 'default') {
    const fallback = {
        plantSuggestions: [
            {
                plantName: 'Tomatoes',
                reason: 'Versatile and easy to grow, perfect for beginners',
                companionPlants: ['Basil', 'Marigolds'],
                seasonalTiming: 'Plant in spring after last frost'
            }
        ],
        recipeSuggestions: [
            {
                recipeName: 'Garden Fresh Salad',
                reason: 'Uses common seasonal vegetables',
                keyIngredients: ['Lettuce', 'Tomatoes', 'Cucumbers'],
                culturalOrigin: 'Mediterranean'
            }
        ],
        seasonalTips: [
            'This is a great time to start composting',
            'Consider adding mulch to retain moisture'
        ],
        biodiversityInsights: [
            'Companion planting increases beneficial insect populations',
            'Diverse crops improve soil health naturally'
        ]
    };
    if (!openai) {
        return fallback;
    }
    const contextPrompt = `
    User Context:
    - Region: ${userContext.region || 'Not specified'}
    - Current Season: ${userContext.season || 'Not specified'}
    - Saved Plants: ${userContext.savedPlants?.join(', ') || 'None yet'}
    - Saved Recipes: ${userContext.savedRecipes?.join(', ') || 'None yet'}
    - Dietary Preferences: ${userContext.dietaryPreferences?.join(', ') || 'Not specified'}
    - Cultural Preferences: ${userContext.culturalPreferences?.join(', ') || 'Not specified'}
    
    Based on this context, provide:
    1. 3-5 personalized plant growing suggestions appropriate for their region and season
    2. 3-5 recipe ideas that match their preferences and potentially use plants they're growing
    3. 3-5 current seasonal tips for their region
    4. 3-5 biodiversity insights relevant to their context
    
    Make suggestions:
    - Practical and achievable
    - Culturally respectful
    - Seasonally appropriate
    - Focused on regenerative practices
    - Connected to their existing interests
  `;
    const systemPrompt = `You are an intelligent agricultural and culinary advisor.
You provide personalized, context-aware suggestions that help users grow food sustainably and cook deliciously.
Your recommendations consider climate, season, user preferences, and biodiversity principles.`;
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-2024-08-06',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: contextPrompt }
            ],
            temperature: 0.8, // Higher creativity for suggestions
            response_format: (0, zod_2.zodResponseFormat)(SmartSuggestionsSchema, 'SmartSuggestions')
        });
        const content = completion.choices[0]?.message?.content;
        if (content) {
            const parsed = JSON.parse(content);
            return SmartSuggestionsSchema.parse(parsed);
        }
    }
    catch (error) {
        console.error('Smart suggestions generation failed:', error);
    }
    return fallback;
}
/**
 * Refine previous AI output with user feedback
 */
async function refineOutput(originalRequest, originalOutput, userFeedback, outputType, userId = 'default') {
    if (!openai) {
        return originalOutput;
    }
    const refinementPrompt = `
    Original Request: ${JSON.stringify(originalRequest)}
    
    Previous Output: ${JSON.stringify(originalOutput)}
    
    User Feedback: "${userFeedback}"
    
    Please refine the output based on the user's feedback. Maintain the same structure but adjust:
    - Content that the user wants changed
    - Details they want added or removed
    - Preferences they've expressed
    
    Keep what worked well and improve what the user mentioned.
  `;
    const systemPrompts = {
        'plant-plan': 'You are an agroecology mentor helping refine plant care plans based on user feedback.',
        'recipe': 'You are a chef helping adjust recipes based on user preferences and feedback.',
        'nutrition': 'You are a nutrition coach refining meal plans based on user needs.',
        'story': 'You are a food historian adjusting narratives based on user interests.'
    };
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-2024-08-06',
            messages: [
                { role: 'system', content: systemPrompts[outputType] },
                { role: 'user', content: refinementPrompt }
            ],
            temperature: 0.7,
            response_format: { type: 'json_object' }
        });
        const content = completion.choices[0]?.message?.content;
        if (content) {
            return JSON.parse(content);
        }
    }
    catch (error) {
        console.error('Output refinement failed:', error);
    }
    return originalOutput;
}
/**
 * Answer follow-up questions about generated content
 */
async function answerFollowUpQuestion(originalContent, question, contentType, userId = 'default') {
    if (!openai) {
        return 'Unable to answer - AI service not available';
    }
    const contextPrompts = {
        'plant-plan': 'You are an agroecology expert answering questions about a plant care plan.',
        'recipe': 'You are a culinary expert answering questions about a recipe.',
        'nutrition': 'You are a nutrition coach answering questions about a meal plan.',
        'story': 'You are a food historian answering questions about a food story.'
    };
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: contextPrompts[contentType] },
                {
                    role: 'user',
                    content: `Context: ${JSON.stringify(originalContent)}\n\nQuestion: ${question}\n\nProvide a helpful, detailed answer.`
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        });
        return completion.choices[0]?.message?.content || 'Unable to generate answer';
    }
    catch (error) {
        console.error('Follow-up question failed:', error);
        return 'Unable to answer question at this time';
    }
}
/**
 * Generate conversational chat response
 */
async function generateChatResponse(userMessage, conversationHistory, userId = 'default') {
    if (!openai) {
        return 'Chat service not available';
    }
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are a friendly, knowledgeable assistant for a regenerative agriculture and plant-based food app called "Planted".
You help users with:
- Plant care and gardening advice
- Recipe suggestions and cooking tips
- Nutrition guidance
- Food culture and history
- Biodiversity and sustainability

Be helpful, warm, and encouraging. Keep responses concise but informative.`
                },
                ...conversationHistory.map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                { role: 'user', content: userMessage }
            ],
            temperature: 0.8,
            max_tokens: 300
        });
        return completion.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response.';
    }
    catch (error) {
        console.error('Chat response failed:', error);
        return 'I apologize, but I encountered an error. Please try again.';
    }
}
