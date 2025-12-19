"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePlantPlan = generatePlantPlan;
exports.generateRecipes = generateRecipes;
exports.generateNutritionCoachPlan = generateNutritionCoachPlan;
exports.generateLearningPathways = generateLearningPathways;
exports.generateStorytelling = generateStorytelling;
const openai_1 = __importDefault(require("openai"));
const zod_1 = require("openai/helpers/zod");
const zod_2 = require("zod");
const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey
    ? new openai_1.default({ apiKey: openaiApiKey })
    : null;
// Zod schemas for structured outputs
const PlantProgressMetricSchema = zod_2.z.object({
    label: zod_2.z.string().describe('Metric name (e.g., "Soil Health")'),
    guidance: zod_2.z.string().describe('Actionable guidance for this metric'),
    value: zod_2.z.number().min(0).max(100).describe('Progress percentage 0-100'),
    status: zod_2.z.enum(['stable', 'attention', 'critical']).describe('Current status level')
});
const PlantPlanSchema = zod_2.z.object({
    summary: zod_2.z.string().describe('Brief overview of care plan tailored to plant and conditions'),
    dailySchedule: zod_2.z.array(zod_2.z.string()).describe('Array of daily care tasks'),
    weeklySchedule: zod_2.z.array(zod_2.z.string()).describe('Array of weekly care tasks'),
    soilAmendments: zod_2.z.array(zod_2.z.string()).describe('Recommended soil improvements'),
    recoveryTips: zod_2.z.array(zod_2.z.string()).describe('Troubleshooting tips for common issues'),
    progressTrackers: zod_2.z.array(PlantProgressMetricSchema).describe('Key metrics to monitor with current values')
});
const RecipeIdeaSchema = zod_2.z.object({
    title: zod_2.z.string().describe('Recipe name'),
    description: zod_2.z.string().describe('Brief description of the dish'),
    ingredients: zod_2.z.array(zod_2.z.string()).describe('List of ingredients with specific measurements (e.g., "2 cups diced tomatoes", "1 tbsp olive oil")'),
    steps: zod_2.z.array(zod_2.z.string()).describe('Detailed step-by-step cooking instructions with temperatures and times'),
    prepTime: zod_2.z.string().describe('Preparation time (e.g., "15 minutes")'),
    cookTime: zod_2.z.string().describe('Cooking time (e.g., "30 minutes")'),
    servings: zod_2.z.string().describe('Number of servings (e.g., "4-6 servings")'),
    difficulty: zod_2.z.enum(['Easy', 'Medium', 'Advanced']).describe('Recipe difficulty level'),
    nutritionHighlights: zod_2.z.array(zod_2.z.string()).describe('3-5 key nutritional benefits or highlights'),
    culturalNotes: zod_2.z.string().optional().describe('Cultural context, traditions, or historical significance'),
    tips: zod_2.z.array(zod_2.z.string()).optional().describe('2-3 cooking tips or variations')
});
const RecipeResponseSchema = zod_2.z.object({
    spotlight: RecipeIdeaSchema.describe('Featured recipe highlighting user ingredients'),
    alternates: zod_2.z.array(RecipeIdeaSchema).describe('2-3 alternative recipe ideas')
});
const MealPrepPlanSchema = zod_2.z.object({
    day: zod_2.z.string().describe('Day of week'),
    meals: zod_2.z.array(zod_2.z.string()).describe('Meal names or brief descriptions'),
    prepTips: zod_2.z.array(zod_2.z.string()).describe('Preparation tips for efficiency')
});
const NutritionCoachResponseSchema = zod_2.z.object({
    overview: zod_2.z.string().describe('Summary of nutrition plan approach'),
    plans: zod_2.z.array(MealPrepPlanSchema).describe('Daily meal plans for the week'),
    shoppingList: zod_2.z.array(zod_2.z.string()).describe('Complete shopping list for all meals')
});
const LearningPathwaySchema = zod_2.z.object({
    title: zod_2.z.string().describe('Learning module title'),
    durationMinutes: zod_2.z.number().describe('Estimated completion time in minutes'),
    milestones: zod_2.z.array(zod_2.z.string()).describe('Key learning objectives or checkpoints'),
    ethicalFocus: zod_2.z.string().describe('Core ethical or sustainability theme')
});
const StorytellingResponseSchema = zod_2.z.object({
    narrative: zod_2.z.string().describe('Rich narrative about the dish, its history, cultural significance, and traditions'),
    scienceInsights: zod_2.z.array(zod_2.z.string()).describe('3-5 scientific or nutritional insights about the ingredients or preparation')
});
const conversationContexts = new Map();
function getConversationContext(userId, systemPrompt) {
    if (!conversationContexts.has(userId)) {
        conversationContexts.set(userId, {
            userId,
            history: [{ role: 'system', content: systemPrompt }],
            preferences: {}
        });
    }
    return conversationContexts.get(userId);
}
function updateConversationHistory(userId, userMessage, assistantMessage) {
    const context = conversationContexts.get(userId);
    if (context) {
        context.history.push({ role: 'user', content: userMessage }, { role: 'assistant', content: assistantMessage });
        // Keep last 10 messages to prevent context overflow
        if (context.history.length > 21) { // 1 system + 10 user/assistant pairs
            context.history = [
                context.history[0], // Keep system message
                ...context.history.slice(-20) // Keep last 10 pairs
            ];
        }
    }
}
// Enhanced prompt function with structured outputs
async function runStructuredPrompt(systemPrompt, userPrompt, zodSchema, schemaName, fallback, userId = 'default') {
    if (!openai) {
        console.warn('OpenAI not configured, returning fallback');
        return fallback;
    }
    try {
        const context = getConversationContext(userId, systemPrompt);
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-2024-08-06', // Latest model with structured outputs support
            messages: [
                ...context.history,
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            response_format: (0, zod_1.zodResponseFormat)(zodSchema, schemaName)
        });
        const content = completion.choices[0]?.message?.content;
        if (content) {
            const parsed = JSON.parse(content);
            // Validate with Zod schema
            const validated = zodSchema.parse(parsed);
            updateConversationHistory(userId, userPrompt, content);
            return validated;
        }
    }
    catch (error) {
        console.error('Structured AI request failed:', error);
    }
    return fallback;
}
// Vision analysis function for images
async function analyzeImage(imageUrl, analysisPrompt, userId = 'default') {
    if (!openai) {
        return 'Image analysis unavailable - OpenAI not configured';
    }
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o', // Vision-capable model
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: analysisPrompt },
                        { type: 'image_url', image_url: { url: imageUrl } }
                    ]
                }
            ],
            max_tokens: 500
        });
        return completion.choices[0]?.message?.content || 'Unable to analyze image';
    }
    catch (error) {
        console.error('Image analysis failed:', error);
        return 'Image analysis failed';
    }
}
// Specialized vision analysis for plant health
async function analyzePlantHealth(imageUrls, plantName) {
    if (imageUrls.length === 0)
        return '';
    const analysisPrompt = `Analyze this ${plantName} plant image for:
1. Overall health status (healthy, stressed, diseased)
2. Pest identification (look for insects, eggs, webbing, damage patterns)
3. Disease symptoms (spots, discoloration, wilting, mold, rot)
4. Growth stage and development
5. Environmental stress indicators (sun damage, water stress, nutrient deficiency)
6. Immediate action recommendations

Provide a detailed, practical assessment that helps the gardener understand what's happening and what to do.`;
    const analyses = await Promise.all(imageUrls.map(url => analyzeImage(url, analysisPrompt)));
    return analyses.join('\n\n---\n\n');
}
// Specialized vision analysis for pantry ingredients
async function analyzePantryIngredients(imageUrls) {
    if (imageUrls.length === 0)
        return [];
    const analysisPrompt = `Analyze this pantry/food image and identify ALL visible ingredients with detailed information.

For each ingredient, provide:
1. Specific name and variety (e.g., "Roma tomatoes" not just "tomatoes")
2. Estimated quantity or condition visible
3. Freshness indicators (fresh, ripe, needs use soon)

Categories to look for:
- Fresh produce: vegetables, fruits, herbs (note colors, varieties)
- Proteins: meats, fish, eggs, tofu, legumes, nuts
- Grains & starches: rice, pasta, bread, flour, potatoes
- Dairy & alternatives: milk, cheese, yogurt, plant milks
- Oils & fats: cooking oils, butter, ghee
- Condiments & sauces: soy sauce, vinegar, tomato paste
- Spices & seasonings: dried herbs, spices, salt, pepper
- Canned/jarred goods: beans, tomatoes, pickles
- Other ingredients visible

Format your response as a simple list of ingredients, one per line, being as specific as possible about varieties and types.
Focus on ingredients that could be used in recipes.`;
    
    const analyses = await Promise.all(imageUrls.map(url => analyzeImage(url, analysisPrompt)));
    
    // Combine and deduplicate ingredients with better parsing
    const allIngredients = analyses
        .flatMap(text => text.split('\n'))
        .map(line => line.trim())
        .filter(line => line.length > 0 && line.length < 100) // Filter out headers and long explanations
        .filter(line => !line.toLowerCase().startsWith('categories') && 
                       !line.toLowerCase().startsWith('for each') &&
                       !line.includes(':') ||
                       line.split(':').length === 2) // Keep simple ingredient descriptions
        .map(line => {
            // Clean up bullets, numbers, and formatting
            line = line.replace(/^[\d\.\)]+\s*/, ''); // Remove numbering
            line = line.replace(/^[•\-*]\s*/, ''); // Remove bullets
            line = line.split(':')[0].trim(); // Take first part if there's a colon
            return line;
        })
        .filter(line => line.length > 2 && line.length < 80); // Reasonable ingredient name length
    
    return [...new Set(allIngredients)];
}
// Specialized vision analysis for meal nutrition
async function analyzeMealNutrition(imageUrls) {
    if (imageUrls.length === 0)
        return '';
    const analysisPrompt = `Analyze this meal image for nutritional content:
1. Identify all foods and estimated portions
2. Estimate macronutrients (protein, carbs, fats)
3. Assess nutritional balance
4. Identify vegetables, whole grains, proteins
5. Suggest improvements for better nutrition
6. Estimate calorie range

Provide practical, educational feedback about the meal's nutritional value.`;
    const analyses = await Promise.all(imageUrls.map(url => analyzeImage(url, analysisPrompt)));
    return analyses.join('\n\n---\n\n');
}
// Specialized vision analysis for cultural food context
async function analyzeFoodCulture(imageUrls, culturalContext) {
    if (imageUrls.length === 0)
        return '';
    const contextNote = culturalContext ? ` The cultural context is: ${culturalContext}` : '';
    const analysisPrompt = `Analyze this food/dish image for cultural and historical insights:
1. Identify the dish or food items
2. Recognize cultural or regional characteristics
3. Identify traditional ingredients or preparation methods
4. Note any ceremonial or symbolic elements
5. Suggest historical or cultural significance
6. Identify cooking techniques visible in the image${contextNote}

Provide rich, respectful cultural context that enhances storytelling.`;
    const analyses = await Promise.all(imageUrls.map(url => analyzeImage(url, analysisPrompt)));
    return analyses.join('\n\n---\n\n');
}
async function generatePlantPlan(request, userId = 'default') {
    const fallback = {
        summary: `Focus on soil vitality and biodiversity to support ${request.plantName}.`,
        dailySchedule: [
            'Inspect leaves for pests or discoloration',
            'Mist foliage during hottest hours if humidity is low'
        ],
        weeklySchedule: [
            'Deep watering with rainwater or compost tea',
            'Add chopped mulch or leaf litter to retain moisture'
        ],
        soilAmendments: [
            'Vermicompost top dressing',
            'Crushed eggshell buffer for calcium'
        ],
        recoveryTips: [
            'Introduce companion plants that attract ladybugs',
            'Rotate compost teas with neem foliar spray if pests persist'
        ],
        progressTrackers: [
            {
                label: 'Moisture stewardship',
                guidance: 'Mulch depth steady at 5cm; monitor runoff after storms.',
                value: 72,
                status: 'stable'
            },
            {
                label: 'Pest resilience',
                guidance: 'Ladybug counts dipped; add dill + fennel near guild.',
                value: 48,
                status: 'attention'
            },
            {
                label: 'Soil biology',
                guidance: 'Compost tea cadence every 10 days to lift microbial diversity.',
                value: 64,
                status: 'stable'
            }
        ]
    };
    // Analyze plant photos if provided using specialized plant health analysis
    let imageAnalysis = '';
    const photoUrls = (request.observations
        ?.map(obs => obs.photoUrl)
        .filter((url) => !!url) || []);
    if (photoUrls.length > 0) {
        imageAnalysis = await analyzePlantHealth(photoUrls, request.plantName);
    }
    const enhancedContext = `
    Plant: ${request.plantName}
    Growth Stage: ${request.growthStage}
    Location: ${request.climate.country}
    ${request.climate.hardinessZone ? `Hardiness Zone: ${request.climate.hardinessZone}` : ''}
    ${request.climate.rainfallPattern ? `Rainfall: ${request.climate.rainfallPattern}` : ''}
    ${request.climate.avgTempC ? `Avg Temp: ${request.climate.avgTempC}°C` : ''}
    
    Biodiversity Concerns: ${request.biodiversityConcerns.join(', ')}
    ${request.observations ? `Observations: ${request.observations.map(o => o.note).join('; ')}` : ''}
    ${imageAnalysis}
    
    Please create a comprehensive, regenerative care plan that:
    1. Addresses the specific growth stage and climate conditions
    2. Tackles the biodiversity concerns with ecological solutions
    3. Provides actionable daily and weekly tasks
    4. Recommends natural soil amendments
    5. Offers troubleshooting tips
    6. Includes 3-5 progress tracking metrics with current estimated values
  `;
    const systemPrompt = `You are an expert agroecology mentor and regenerative agriculture specialist. 
You provide science-based, culturally-respectful plant care advice that enhances biodiversity, soil health, and ecological resilience.
Your recommendations are practical, accessible, and promote sustainable practices.
Always consider local ecosystems, companion planting, and natural pest management.`;
    return runStructuredPrompt(systemPrompt, enhancedContext, PlantPlanSchema, 'PlantPlanResponse', fallback, userId);
}
async function generateRecipes(request, userId = 'default') {
    const fallback = {
        spotlight: {
            title: 'Heritage Garden Bowl',
            description: 'A vibrant, zero-waste meal built from seasonal produce, featuring roasted vegetables, whole grains, and a zesty herb dressing.',
            ingredients: [
                '2 cups mixed seasonal vegetables, chopped',
                '1 cup cooked quinoa or brown rice',
                '2 tablespoons olive oil',
                '1 teaspoon mixed dried herbs',
                '2 tablespoons lemon juice',
                '1/4 cup toasted seeds',
                'Salt and pepper to taste'
            ],
            steps: [
                'Preheat oven to 400°F (200°C)',
                'Toss vegetables with oil and herbs',
                'Roast for 20-25 minutes until golden',
                'Prepare citrus-herb dressing',
                'Layer grains, vegetables, and greens',
                'Drizzle with dressing and top with seeds'
            ],
            prepTime: '15 minutes',
            cookTime: '25 minutes',
            servings: '4 servings',
            difficulty: 'Easy',
            nutritionHighlights: [
                'High in fiber from whole grains',
                'Rich in vitamins from seasonal produce',
                'Healthy fats from olive oil and seeds'
            ],
            culturalNotes: `Celebrates ${request.culturalPreferences[0] ?? 'regional'} flavors while promoting zero-waste cooking.`,
            tips: [
                'Use any vegetables you have available',
                'Meal prep by roasting vegetables in advance'
            ]
        },
        alternates: [
            {
                title: 'Comforting Lentil Stew',
                description: 'Slow-simmered red lentils with warming aromatics.',
                ingredients: [
                    '1 cup red lentils',
                    '1 onion, diced',
                    '3 cloves garlic',
                    '4 cups vegetable broth',
                    '2 teaspoons cumin',
                    'Salt and pepper to taste'
                ],
                steps: [
                    'Sauté onion until softened',
                    'Add garlic and spices',
                    'Add lentils and broth',
                    'Simmer for 25 minutes',
                    'Season and serve'
                ],
                prepTime: '10 minutes',
                cookTime: '30 minutes',
                servings: '6 servings',
                difficulty: 'Easy',
                nutritionHighlights: [
                    'Excellent plant-based protein',
                    'High in iron and folate',
                    'Rich in fiber'
                ],
                tips: [
                    'Add greens in the last few minutes',
                    'Top with yogurt for extra creaminess'
                ]
            }
        ]
    };
    // Analyze pantry photos if provided using specialized ingredient detection
    let detectedIngredients = [];
    if (request.pantryPhotoUrls && request.pantryPhotoUrls.length > 0) {
        detectedIngredients = await analyzePantryIngredients(request.pantryPhotoUrls);
    }
    // Combine user-provided and AI-detected ingredients
    const allIngredients = [
        ...request.availableIngredients,
        ...detectedIngredients
    ];
    const uniqueIngredients = [...new Set(allIngredients)];
    const enhancedContext = `
    Available Ingredients: ${uniqueIngredients.join(', ')}
    ${detectedIngredients.length > 0 ? `\n    AI-Detected from Photos: ${detectedIngredients.join(', ')}` : ''}
    Dietary Needs: ${request.dietaryNeeds.join(', ') || 'None specified'}
    Cultural Preferences: ${request.culturalPreferences.join(', ') || 'Open to all cuisines'}
    ${request.season ? `Season: ${request.season}` : 'Season: Any'}
    
    Please create COMPREHENSIVE, DETAILED recipes:
    
    1. One SPOTLIGHT recipe that creatively showcases the available ingredients
    2. 2-3 ALTERNATE recipes offering variety in cuisine styles, cooking methods, and meal types
    
    CRITICAL Requirements for EACH recipe:
    
    INGREDIENTS:
    - List EXACT measurements (e.g., "2 cups diced tomatoes", "1 tablespoon olive oil", "1 medium onion, chopped")
    - Specify preparation method in ingredient (e.g., "diced", "minced", "julienned")
    - Include optional garnishes and finishing touches
    - Prioritize the available ingredients listed above
    
    INSTRUCTIONS:
    - Provide DETAILED step-by-step instructions (at least 5-8 steps)
    - Include specific cooking temperatures (e.g., "350°F/175°C")
    - Mention exact timing for each step (e.g., "sauté for 3-4 minutes until translucent")
    - Describe visual and sensory cues (e.g., "until golden brown and fragrant")
    - Include techniques (e.g., "deglaze with wine", "fold gently", "season to taste")
    
    TIMES & SERVINGS:
    - Specify realistic prep time
    - Specify realistic cook time
    - Indicate servings clearly (e.g., "4-6 servings")
    - Mark difficulty level appropriately
    
    NUTRITION & BENEFITS:
    - List 3-5 specific nutritional highlights (e.g., "High in vitamin C from bell peppers", "Rich in plant-based protein from chickpeas")
    - Mention health benefits when relevant
    - Note any superfoods or particularly nutritious ingredients
    
    CULTURAL CONTEXT:
    - Provide rich cultural background or food history
    - Explain regional variations or traditional preparation methods
    - Mention ceremonial or seasonal significance if applicable
    - Be respectful and educational about food traditions
    
    COOKING TIPS:
    - Include 2-3 practical tips for success
    - Suggest variations or substitutions
    - Provide storage and reheating guidance when relevant
    
    Additional Guidelines:
    - Honor specified dietary restrictions strictly
    - Focus on sustainable, plant-forward choices
    - Minimize food waste by using whole ingredients
    - Make recipes accessible for home cooks
    - Celebrate global flavors and techniques
    - Ensure recipes are actually cookable and delicious
  `;
    const systemPrompt = `You are a world-class culinary anthropologist, professional chef, and nutrition educator specializing in plant-based, culturally-diverse cuisine.

Your expertise includes:
- Global cooking techniques and flavor profiles
- Food history and cultural traditions
- Nutritional science and health benefits
- Sustainable cooking and zero-waste practices
- Dietary accommodations and allergies
- Recipe development and food writing

You create comprehensive, detailed recipes that are:
- Professionally written with exact measurements and techniques
- Culturally respectful and educational
- Nutritionally balanced and health-conscious
- Practical for home cooks of varying skill levels
- Delicious, creative, and inspiring

Your recipes honor food traditions, minimize waste, celebrate biodiversity, and empower people to cook confidently.`;
    return runStructuredPrompt(systemPrompt, enhancedContext, RecipeResponseSchema, 'RecipeResponse', fallback, userId);
}
async function generateNutritionCoachPlan(request, userId = 'default') {
    const fallbackPlans = Array.from({ length: 7 }).map((_, idx) => ({
        day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][idx],
        meals: ['Sunrise smoothie', 'Heritage grain lunch', 'Brothy supper'],
        prepTips: ['Batch chop produce', 'Soak legumes overnight', 'Share meals family-style']
    }));
    const fallback = {
        overview: 'Balanced rhythm of prep blocks to reduce decision fatigue.',
        plans: fallbackPlans,
        shoppingList: ['Seasonal veg', 'Whole grains', 'Ferments', 'Protein of choice']
    };
    // Analyze meal photos if provided using specialized nutrition analysis
    let mealAnalysis = '';
    if (request.mealPhotoUrls && request.mealPhotoUrls.length > 0) {
        mealAnalysis = await analyzeMealNutrition(request.mealPhotoUrls);
    }
    const enhancedContext = `
    Household Size: ${request.householdSize} people
    Focus Areas: ${request.focusAreas.join(', ')}
    Daily Prep Time Available: ${request.timeAvailablePerDay} minutes
    ${mealAnalysis ? `\n    Current Meal Analysis from Photos:\n${mealAnalysis}\n\n    Use this analysis to provide personalized recommendations that address any nutritional gaps or imbalances observed in the user's current meals.` : ''}
    
    Please create a comprehensive 7-day meal prep plan that:
    1. Provides balanced nutrition targeting the focus areas
    2. Fits within the available prep time
    3. Scales appropriately for ${request.householdSize} people
    4. Minimizes food waste through smart ingredient reuse
    5. Includes specific meal names/descriptions for breakfast, lunch, dinner
    6. Offers practical prep tips for efficiency
    7. Generates a complete, organized shopping list
    
    Consider:
    - Batch cooking strategies
    - Seasonal, accessible ingredients
    - Cultural food diversity
    - Plant-forward nutrition
    - Budget-friendly options
  `;
    const systemPrompt = `You are an expert nutrition coach and meal planning specialist.
You design practical, nutritious meal plans that respect cultural diversity, promote wellness, and fit real-life constraints.
Your plans emphasize whole foods, plant-based nutrition, and sustainable eating patterns while being accessible and enjoyable.`;
    return runStructuredPrompt(systemPrompt, enhancedContext, NutritionCoachResponseSchema, 'NutritionCoachResponse', fallback, userId);
}
async function generateLearningPathways(country, userId = 'default') {
    const fallback = [
        {
            title: 'Soil-to-Table Stewardship',
            durationMinutes: 35,
            milestones: ['Compost basics', 'Biodiversity tasting', 'Community reflection'],
            ethicalFocus: 'Regenerative agriculture'
        }
    ];
    const LearningPathwaysSchema = zod_2.z.object({
        pathways: zod_2.z.array(LearningPathwaySchema).describe('Array of 3-5 learning modules')
    });
    const enhancedContext = `
    Target Country/Region: ${country}
    
    Create 3-5 educational learning pathways about sustainable food systems, regenerative agriculture, 
    and biodiversity conservation that are:
    1. Culturally appropriate for ${country}
    2. Actionable with clear milestones
    3. 20-60 minutes duration each
    4. Focused on ethical, ecological themes
    5. Accessible to diverse audiences
    
    Topics could include:
    - Local food traditions and indigenous knowledge
    - Composting and soil health
    - Biodiversity and pollinators
    - Water conservation
    - Companion planting
    - Food sovereignty
    - Climate-resilient agriculture
  `;
    const systemPrompt = `You are an educational curriculum designer specializing in food systems, agroecology, and sustainability education.
You create engaging, culturally-responsive learning experiences that empower people to participate in regenerative food systems.
Your modules balance scientific knowledge with traditional wisdom and practical skills.`;
    const result = await runStructuredPrompt(systemPrompt, enhancedContext, LearningPathwaysSchema, 'LearningPathways', { pathways: fallback }, userId);
    return result.pathways;
}
async function generateStorytelling(request, userId = 'default') {
    const fallback = {
        narrative: `${request.dishName} reflects resilience and biodiversity stewardship across ${request.region}.`,
        scienceInsights: [
            'Fermentation fosters beneficial microbes supporting gut health.',
            'Spice blends contribute phytonutrients that reduce inflammation.'
        ]
    };
    // Analyze food culture photos if provided
    let culturalAnalysis = '';
    if (request.foodPhotoUrls && request.foodPhotoUrls.length > 0) {
        culturalAnalysis = await analyzeFoodCulture(request.foodPhotoUrls, request.region);
    }
    const enhancedContext = `
    Dish Name: ${request.dishName}
    Region/Culture: ${request.region}
    ${culturalAnalysis ? `\nCULTURAL PHOTO ANALYSIS:\n${culturalAnalysis}\n\nPlease incorporate these visual insights into your narrative, referencing specific dishes, ingredients, or ceremonial elements observed in the photos.` : ''}
    
    Please create a rich, engaging narrative about this dish that:
    
    1. CULTURAL HERITAGE (2-3 paragraphs):
       - Historical origins and evolution
       - Cultural significance and traditions
       - How it reflects local ecosystems and seasons
       - Stories of how it brings communities together
       - Connections to agricultural practices
    
    2. SCIENCE INSIGHTS (4-6 points):
       - Nutritional benefits of key ingredients
       - Health properties of preparation methods
       - Biodiversity connections (crop varieties, pollinators)
       - Sustainability aspects
       - Flavor chemistry or fermentation science
       - Climate adaptation strategies
    
    Make it:
    - Respectful and authentic to the culture
    - Educational yet accessible
    - Celebrating both tradition and science
    - Highlighting ecological wisdom
  `;
    const systemPrompt = `You are a cultural food historian, anthropologist, and nutrition scientist.
You weave together compelling narratives that honor food traditions while revealing the scientific wisdom embedded in cultural practices.
Your stories celebrate diversity, ecological stewardship, and the deep connections between food, culture, and land.
You write with warmth, respect, and scholarly accuracy.`;
    return runStructuredPrompt(systemPrompt, enhancedContext, StorytellingResponseSchema, 'StorytellingResponse', fallback, userId);
}
