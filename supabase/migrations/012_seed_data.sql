-- Migration 012: Seed Data
-- Description: Insert sample ideas including the 5 free tier ideas and BuyButton
-- Created: 2025-11-06
-- Note: This is optional seed data for development/testing

-- ============================================================================
-- FREE TIER IDEAS (Accessible to non-authenticated users)
-- ============================================================================

-- Idea 1: Africana History Quiz & Trivia Platform
INSERT INTO ideas (
    title,
    description,
    category,
    difficulty,
    tools,
    tags,
    monetization_potential,
    estimated_build_time,
    free_tier
) VALUES (
    'Africana History Quiz & Trivia Platform',
    'Create an interactive quiz platform that tests knowledge of African and African diaspora history, culture, and achievements. Features include multiple difficulty levels, timed challenges, leaderboards, and educational content explaining correct answers. Perfect for educators, students, and anyone interested in learning more about Africana history in an engaging way.',
    'Education & Learning',
    'Beginner',
    ARRAY['Claude', 'Bolt', 'Lovable'],
    ARRAY['education', 'quiz', 'history', 'culture', 'interactive'],
    'Freemium model with basic quizzes free and premium content subscription. Potential for educational institution licensing. Advertising revenue from educational partners.',
    '2-3 weeks',
    true
);

-- Idea 2: Personal Finance Dashboard
INSERT INTO ideas (
    title,
    description,
    category,
    difficulty,
    tools,
    tags,
    monetization_potential,
    estimated_build_time,
    free_tier
) VALUES (
    'Personal Finance Dashboard',
    'Build a comprehensive personal finance dashboard that helps users track expenses, set budgets, visualize spending patterns, and achieve financial goals. Integrates with bank APIs or allows manual entry. Features include expense categorization, monthly/yearly reports, savings goals tracking, and financial insights powered by AI to identify spending trends and suggest improvements.',
    'Personal Productivity & Finance',
    'Intermediate',
    ARRAY['Claude', 'Lovable', 'Google AI Studio'],
    ARRAY['finance', 'budgeting', 'productivity', 'analytics', 'dashboard'],
    'Freemium model with basic features free and premium analytics/insights. Affiliate partnerships with financial services. White-label licensing for financial advisors.',
    '3-4 weeks',
    true
);

-- Idea 3: Habit Tracker with Analytics
INSERT INTO ideas (
    title,
    description,
    category,
    difficulty,
    tools,
    tags,
    monetization_potential,
    estimated_build_time,
    free_tier
) VALUES (
    'Habit Tracker with Analytics',
    'Design a habit tracking application that helps users build and maintain positive habits through daily check-ins, streak tracking, and visual analytics. Features include customizable habit templates, reminder notifications, progress visualization, and AI-powered insights on habit patterns and success factors. Includes social accountability features where users can share progress with friends.',
    'Health & Wellness',
    'Beginner',
    ARRAY['Claude', 'Bolt'],
    ARRAY['habits', 'productivity', 'wellness', 'tracking', 'analytics'],
    'Freemium with basic tracking free and premium analytics/social features. In-app purchases for habit template packs. Corporate wellness program licensing.',
    '2-3 weeks',
    true
);

-- Idea 4: Social Media Content Repurposer
INSERT INTO ideas (
    title,
    description,
    category,
    difficulty,
    tools,
    tags,
    monetization_potential,
    estimated_build_time,
    free_tier
) VALUES (
    'Social Media Content Repurposer',
    'Create a tool that takes long-form content (blog posts, articles, videos) and automatically repurposes it into multiple social media formats. Uses AI to generate platform-specific versions: Twitter threads, LinkedIn posts, Instagram captions, TikTok scripts, etc. Includes hashtag suggestions, optimal posting time recommendations, and content calendar integration.',
    'Marketing & Content Creation',
    'Intermediate',
    ARRAY['Claude', 'Google AI Studio'],
    ARRAY['content-creation', 'social-media', 'marketing', 'automation', 'AI'],
    'Subscription-based pricing tiers by content volume. Agency white-label licensing. Integration marketplace fees. Credits-based pay-per-use option.',
    '3-4 weeks',
    true
);

-- Idea 5: Africana Community Event Planner
INSERT INTO ideas (
    title,
    description,
    category,
    difficulty,
    tools,
    tags,
    monetization_potential,
    estimated_build_time,
    free_tier
) VALUES (
    'Africana Community Event Planner',
    'Develop a community event planning platform specifically designed for African and African diaspora cultural events, festivals, workshops, and gatherings. Features include event discovery, RSVP management, vendor coordination, cultural resource library, and community forum. Helps organizers manage logistics while helping community members discover relevant events.',
    'Community & Cultural Groups',
    'Intermediate',
    ARRAY['Claude', 'Bolt', 'Lovable'],
    ARRAY['community', 'events', 'culture', 'planning', 'networking'],
    'Freemium with basic event listing free and premium features for organizers. Ticketing transaction fees. Vendor directory listing fees. Sponsored event promotions.',
    '4-5 weeks',
    true
);

-- ============================================================================
-- BUYBUTTON IDEA (Special conversion hook - not free tier)
-- ============================================================================

-- BuyButton: Premium conversion example
INSERT INTO ideas (
    title,
    description,
    category,
    difficulty,
    tools,
    tags,
    monetization_potential,
    estimated_build_time,
    free_tier
) VALUES (
    'BuyButton: One-Click Commerce Widget',
    'A lightweight, embeddable "Buy Now" button that can be added to any website, blog, or social media profile. Handles the entire transaction flow including payments, inventory, shipping, and customer management. Perfect for creators, bloggers, and small businesses who want to sell products without building a full e-commerce site. Think "Stripe for selling physical products" - a single line of code that turns any webpage into a storefront.',
    'B2B SaaS Tools',
    'Advanced',
    ARRAY['Claude', 'Bolt'],
    ARRAY['e-commerce', 'saas', 'payments', 'monetization', 'entrepreneurship'],
    'Transaction fee model (2-3% per sale). Premium tiers with advanced features like analytics, custom branding, and multi-product support. White-label licensing for agencies. Estimated $50k-200k ARR potential within first year with proper marketing.',
    '6-8 weeks',
    false
);

-- ============================================================================
-- ADDITIONAL SAMPLE IDEAS (Non-free tier)
-- ============================================================================

-- Sample idea from B2B SaaS Tools category
INSERT INTO ideas (
    title,
    description,
    category,
    difficulty,
    tools,
    tags,
    monetization_potential,
    estimated_build_time,
    free_tier
) VALUES (
    'Meeting Notes AI Assistant',
    'An AI-powered meeting assistant that joins your video calls, transcribes conversations in real-time, identifies action items, and generates comprehensive meeting summaries. Automatically distributes notes to attendees and integrates with project management tools to create tasks from action items. Supports multiple languages and can identify different speakers.',
    'B2B SaaS Tools',
    'Advanced',
    ARRAY['Claude', 'Google AI Studio'],
    ARRAY['AI', 'productivity', 'meetings', 'transcription', 'automation'],
    'Subscription-based SaaS pricing ($10-50/user/month). Enterprise licensing for large organizations. API access for integration partners.',
    '5-6 weeks',
    false
);

-- Sample idea from Education & Learning category
INSERT INTO ideas (
    title,
    description,
    category,
    difficulty,
    tools,
    tags,
    monetization_potential,
    estimated_build_time,
    free_tier
) VALUES (
    'Code Learning Playground',
    'An interactive coding environment where beginners can learn programming through hands-on challenges and instant feedback. Features AI-powered hints, step-by-step tutorials, and a community forum for peer learning. Supports multiple programming languages and includes gamification elements like badges and leaderboards.',
    'Education & Learning',
    'Intermediate',
    ARRAY['Claude', 'Bolt'],
    ARRAY['education', 'coding', 'programming', 'learning', 'interactive'],
    'Freemium model with basic lessons free. Premium courses and certifications. Corporate training licenses. Bootcamp partnerships.',
    '4-5 weeks',
    false
);

-- Sample idea from Games and Puzzles category
INSERT INTO ideas (
    title,
    description,
    category,
    difficulty,
    tools,
    tags,
    monetization_potential,
    estimated_build_time,
    free_tier
) VALUES (
    'Daily Word Puzzle Generator',
    'A daily word puzzle game platform that generates unique crosswords, word searches, and anagrams using AI. Players can compete on leaderboards, create custom puzzles, and challenge friends. Includes difficulty levels from beginner to expert and themed puzzle collections.',
    'Games and Puzzles',
    'Beginner',
    ARRAY['Claude', 'Lovable'],
    ARRAY['games', 'puzzles', 'word-games', 'entertainment', 'AI'],
    'Ad-supported free version with premium ad-free subscription. In-app purchases for puzzle packs. Licensing to educational institutions and newspapers.',
    '2-3 weeks',
    false
);

-- Sample idea from Think Tank & Research category
INSERT INTO ideas (
    title,
    description,
    category,
    difficulty,
    tools,
    tags,
    monetization_potential,
    estimated_build_time,
    free_tier
) VALUES (
    'Research Paper Summarizer',
    'An AI tool that reads academic research papers and generates concise, accessible summaries highlighting key findings, methodologies, and implications. Helps researchers stay current with their field and makes academic research more accessible to the general public. Includes citation management and comparison features.',
    'Think Tank & Research',
    'Intermediate',
    ARRAY['Claude', 'Google AI Studio'],
    ARRAY['research', 'AI', 'summarization', 'academic', 'knowledge'],
    'Subscription model for academics and institutions. API access for research platforms. Premium features for citation tracking and collaboration.',
    '3-4 weeks',
    false
);

-- ============================================================================
-- SEED DATA SUMMARY
-- ============================================================================

-- Log seed data completion
DO $$
DECLARE
    idea_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO idea_count FROM ideas;
    RAISE NOTICE 'Seed data completed. Total ideas in database: %', idea_count;
END $$;
