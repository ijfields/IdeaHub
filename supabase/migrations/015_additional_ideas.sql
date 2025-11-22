-- Migration 015: Additional Ideas from PRD Appendix A
-- Description: Add remaining ideas from PRD to reach full catalog
-- Created: 2025-11-21
-- Note: Adds 43 ideas from PRD Appendix A that are not yet in database

-- ============================================================================
-- CATEGORY 1: B2B SaaS Tools (3 new ideas)
-- ============================================================================

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Project Management Dashboard for Africana Initiatives',
    'A specialized project management tool designed for organizations working on Africana community initiatives, cultural preservation projects, and diaspora-focused programs. Features include grant milestone tracking, community stakeholder management, cultural event coordination, and impact reporting. Integrates with common tools while providing templates specific to community-driven work.',
    'B2B SaaS Tools',
    'Intermediate',
    ARRAY['Claude', 'Bolt', 'Lovable'],
    ARRAY['project-management', 'community', 'africana', 'nonprofits', 'collaboration'],
    'Subscription tiers ($15-50/month per organization). Nonprofit discounts. Grant management add-on features. White-label for community foundations.',
    '4-5 weeks',
    false
);

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Grant Application Assistant',
    'An AI-powered tool that helps organizations write compelling grant applications. Features include grant opportunity matching, proposal template generation, budget builder, deadline tracking, and success rate analytics. Uses AI to analyze successful past applications and suggest improvements to current drafts.',
    'B2B SaaS Tools',
    'Advanced',
    ARRAY['Claude', 'Google AI Studio'],
    ARRAY['grants', 'nonprofits', 'writing', 'AI', 'fundraising'],
    'Freemium model with basic templates free. Premium subscription ($29-99/month) for AI assistance and grant database access. Success-based pricing option for larger grants.',
    '5-6 weeks',
    false
);

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Impact Measurement & Storytelling Tool',
    'Help organizations measure, visualize, and communicate their social impact. Features include customizable impact metrics, data collection forms, automated report generation, and storytelling templates for donors and stakeholders. Generates compelling narratives from raw impact data using AI.',
    'B2B SaaS Tools',
    'Intermediate',
    ARRAY['Claude', 'Lovable'],
    ARRAY['impact', 'nonprofits', 'analytics', 'storytelling', 'reporting'],
    'Subscription model ($20-75/month). Annual report generation add-on. Integration fees for CRM systems. Consulting upsell for impact framework design.',
    '4-5 weeks',
    false
);

-- ============================================================================
-- CATEGORY 2: Book Club & Reading (3 new ideas)
-- ============================================================================

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Africana Book Discussion Guide Generator',
    'Generate comprehensive discussion guides for books by African and African diaspora authors. Features include chapter-by-chapter questions, historical context notes, author background information, thematic analysis prompts, and connections to contemporary issues. Perfect for book clubs, classrooms, and individual readers.',
    'Book Club & Reading',
    'Beginner',
    ARRAY['Claude', 'Bolt'],
    ARRAY['books', 'reading', 'africana', 'discussion', 'education'],
    'Freemium with basic guides free. Premium subscription for unlimited guides and advanced features. Licensing to libraries and schools. Book publisher partnerships.',
    '2-3 weeks',
    false
);

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Reading Schedule & Community Tracker',
    'A social reading platform where book clubs can set reading schedules, track progress together, and discuss chapters as they read. Features include pace-setting tools, spoiler-free discussion zones, reading streak tracking, and virtual meeting scheduler. Gamification elements encourage consistent reading.',
    'Book Club & Reading',
    'Intermediate',
    ARRAY['Claude', 'Lovable'],
    ARRAY['books', 'community', 'tracking', 'book-clubs', 'social'],
    'Freemium with basic tracking free. Premium clubs with advanced features ($5-10/month). In-app book purchases with affiliate revenue. Sponsored reading challenges.',
    '3-4 weeks',
    false
);

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Author Research Tool - Africana Writers Database',
    'A comprehensive database and research tool for discovering African and diaspora authors. Features include author bios, bibliographies, interview archives, literary movement timelines, and recommendation engine. Helps readers discover new authors based on themes, regions, time periods, or writing styles.',
    'Book Club & Reading',
    'Intermediate',
    ARRAY['Claude', 'Google AI Studio'],
    ARRAY['authors', 'research', 'africana', 'literature', 'database'],
    'Freemium access to basic profiles. Premium subscription for full database access and research tools. Licensing to universities and libraries. Author profile sponsorships.',
    '4-5 weeks',
    false
);

-- ============================================================================
-- CATEGORY 3: Community & Cultural Groups (3 new ideas)
-- ============================================================================

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Africana Podcast Archive & Transcript Searchable Database',
    'Create a searchable archive of podcasts featuring African and diaspora voices. Features include automatic transcription, topic tagging, speaker identification, clip extraction, and cross-episode search. Makes podcast knowledge accessible and discoverable for research and casual listening.',
    'Community & Cultural Groups',
    'Advanced',
    ARRAY['Claude', 'Google AI Studio'],
    ARRAY['podcasts', 'archive', 'transcription', 'search', 'africana'],
    'Subscription for full archive access ($10-20/month). API access for researchers. Podcast hosting partnerships. Sponsored playlists and collections.',
    '5-6 weeks',
    false
);

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Episode Discussion Forum Generator',
    'Automatically generate structured discussion forums for podcast episodes. Features include AI-generated discussion prompts, key point summaries, timestamp references, and threaded conversations. Builds community engagement around podcast content.',
    'Community & Cultural Groups',
    'Beginner',
    ARRAY['Claude', 'Bolt'],
    ARRAY['podcasts', 'community', 'discussion', 'forums', 'engagement'],
    'Freemium for podcasters. Premium analytics and engagement tools. White-label for podcast networks. Community sponsorship opportunities.',
    '2-3 weeks',
    false
);

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Live Event Transcription & AI Summary Tool',
    'Real-time transcription and summarization for live cultural events, panels, and discussions. Features include live captioning, speaker identification, key quote extraction, and post-event summary generation. Makes events accessible and creates valuable content archives.',
    'Community & Cultural Groups',
    'Advanced',
    ARRAY['Claude', 'Google AI Studio'],
    ARRAY['transcription', 'events', 'accessibility', 'AI', 'live'],
    'Pay-per-event pricing ($50-200). Monthly subscription for frequent hosts. Accessibility grants for nonprofits. Archive licensing fees.',
    '5-6 weeks',
    false
);

-- ============================================================================
-- CATEGORY 4: Community Building (2 new ideas - 1 already in DB)
-- ============================================================================

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Community Impact Tracker',
    'Track and visualize the collective impact of community initiatives over time. Features include volunteer hours tracking, beneficiary counting, resource distribution mapping, and milestone celebrations. Generates reports for funders and motivates continued participation.',
    'Community Building',
    'Intermediate',
    ARRAY['Claude', 'Lovable'],
    ARRAY['community', 'impact', 'tracking', 'visualization', 'nonprofits'],
    'Freemium for small communities. Premium features for larger organizations ($15-40/month). Annual impact report generation. Integration with donation platforms.',
    '3-4 weeks',
    false
);

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Member Skill Directory & Mentorship Matcher',
    'Build a searchable directory of community member skills and facilitate mentorship connections. Features include skill profiles, mentorship request system, matching algorithm based on goals and expertise, and progress tracking. Strengthens community bonds through knowledge sharing.',
    'Community Building',
    'Intermediate',
    ARRAY['Claude', 'Bolt', 'Lovable'],
    ARRAY['mentorship', 'skills', 'directory', 'matching', 'community'],
    'Free for community use with premium features. White-label for professional associations. Corporate sponsorship of mentorship programs. Career services partnerships.',
    '3-4 weeks',
    false
);

-- ============================================================================
-- CATEGORY 5: Education & Learning (3 new ideas - 3 already in DB with different names)
-- ============================================================================

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Email Newsletter Template Generator',
    'AI-powered tool that generates professional email newsletter templates and content. Features include audience-specific templates, A/B testing suggestions, subject line optimization, and engagement analytics. Helps creators maintain consistent communication with their audience.',
    'Education & Learning',
    'Beginner',
    ARRAY['Claude', 'Bolt'],
    ARRAY['email', 'newsletters', 'marketing', 'templates', 'content'],
    'Freemium with basic templates. Premium subscription for AI-generated content ($10-25/month). Integration with email platforms. Agency white-label option.',
    '2-3 weeks',
    false
);

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'AI-Powered Course Creation Platform',
    'Help educators and experts create comprehensive online courses using AI assistance. Features include curriculum outline generation, lesson content drafting, quiz creation, video script writing, and learning path optimization. Reduces course creation time by 70%.',
    'Education & Learning',
    'Advanced',
    ARRAY['Claude', 'Google AI Studio', 'Lovable'],
    ARRAY['courses', 'education', 'AI', 'e-learning', 'content-creation'],
    'Subscription tiers ($30-100/month). Revenue share on course sales. Enterprise licensing for training departments. Integration marketplace fees.',
    '6-8 weeks',
    false
);

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Interactive Learning Path Builder',
    'Create personalized learning journeys that adapt to student progress and preferences. Features include skill assessment, resource curation from multiple platforms, progress tracking, and AI-powered recommendations for next steps. Supports both self-directed learners and guided programs.',
    'Education & Learning',
    'Intermediate',
    ARRAY['Claude', 'Lovable'],
    ARRAY['learning', 'personalization', 'education', 'adaptive', 'skills'],
    'Freemium for individual learners. Premium features and certifications ($15-40/month). B2B licensing for corporate training. Educational institution partnerships.',
    '4-5 weeks',
    false
);

-- ============================================================================
-- CATEGORY 6: Education & Teaching (3 new ideas)
-- ============================================================================

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Africana Lesson Plan Generator',
    'Generate comprehensive lesson plans incorporating African and diaspora perspectives across subjects. Features include standards alignment, differentiated instruction options, multimedia resource suggestions, and assessment rubrics. Helps teachers integrate diverse perspectives into existing curricula.',
    'Education & Teaching',
    'Intermediate',
    ARRAY['Claude', 'Bolt'],
    ARRAY['education', 'teaching', 'lesson-plans', 'africana', 'curriculum'],
    'Freemium with basic plans. Premium subscription for unlimited generation and customization ($12-30/month). School district licensing. Professional development workshops.',
    '3-4 weeks',
    false
);

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Culturally Responsive Teaching Resource Library',
    'A curated library of teaching resources, activities, and materials that center diverse cultural perspectives. Features include searchable database, lesson integration guides, student engagement strategies, and community-contributed content. Supports teachers in creating inclusive classrooms.',
    'Education & Teaching',
    'Beginner',
    ARRAY['Claude', 'Lovable'],
    ARRAY['teaching', 'resources', 'diversity', 'inclusion', 'education'],
    'Freemium access to basic resources. Premium membership for full library ($8-20/month). School subscriptions. Grant funding for underserved schools.',
    '3-4 weeks',
    false
);

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Student Assignment Rubric Builder',
    'Create detailed, fair, and transparent assignment rubrics using AI assistance. Features include standards-based criteria, point distribution suggestions, example responses at each level, and student-friendly language options. Saves teachers hours while improving assessment clarity.',
    'Education & Teaching',
    'Beginner',
    ARRAY['Claude', 'Bolt'],
    ARRAY['assessment', 'rubrics', 'teaching', 'grading', 'education'],
    'Freemium for individual teachers. Premium features ($8-15/month). School/district licensing. Integration with LMS platforms.',
    '2-3 weeks',
    false
);

-- ============================================================================
-- CATEGORY 7: Games and Puzzles (1 new idea - 2 already in DB)
-- ============================================================================

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Interactive Map Builder - Diaspora Connections',
    'Create interactive maps showing African diaspora connections, migration patterns, and cultural influences worldwide. Features include timeline animations, story overlays, user-contributed locations, and educational annotations. Perfect for educators, researchers, and heritage explorers.',
    'Games and Puzzles',
    'Intermediate',
    ARRAY['Claude', 'Lovable'],
    ARRAY['maps', 'diaspora', 'interactive', 'history', 'education'],
    'Freemium access to view maps. Premium for creating custom maps ($10-25/month). Educational licensing. Museum and cultural center partnerships.',
    '4-5 weeks',
    false
);

-- ============================================================================
-- CATEGORY 8: Health & Wellness (2 new ideas - 1 already in DB)
-- ============================================================================

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Mental Health Journaling App with AI Insights',
    'A private journaling app that uses AI to identify patterns in mood, triggers, and coping strategies. Features include guided prompts, sentiment analysis over time, gratitude tracking, and gentle suggestions for mental wellness practices. Privacy-first design with optional therapist sharing.',
    'Health & Wellness',
    'Intermediate',
    ARRAY['Claude', 'Lovable'],
    ARRAY['mental-health', 'journaling', 'AI', 'wellness', 'self-care'],
    'Freemium with basic journaling. Premium AI insights and features ($8-15/month). Therapist integration partnerships. Corporate wellness program licensing.',
    '3-4 weeks',
    false
);

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Wellness Challenge Tracker & Community',
    'Create and join wellness challenges with friends, family, or community groups. Features include customizable challenges (hydration, steps, meditation), progress sharing, accountability partners, and celebration milestones. Gamification makes healthy habits fun and social.',
    'Health & Wellness',
    'Beginner',
    ARRAY['Claude', 'Bolt'],
    ARRAY['wellness', 'challenges', 'community', 'fitness', 'habits'],
    'Freemium with basic challenges. Premium features and custom challenges ($5-12/month). Corporate wellness partnerships. Sponsored challenges from health brands.',
    '2-3 weeks',
    false
);

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Sleep Optimization Recommendation Engine',
    'Analyze sleep patterns and provide personalized recommendations for better rest. Features include sleep diary tracking, environmental factor analysis, bedtime routine suggestions, and integration with wearable devices. Uses AI to identify patterns affecting sleep quality.',
    'Health & Wellness',
    'Intermediate',
    ARRAY['Claude', 'Google AI Studio'],
    ARRAY['sleep', 'health', 'optimization', 'AI', 'wellness'],
    'Freemium tracking with premium AI recommendations ($8-20/month). Partnerships with mattress and sleep product companies. Integration licensing for health apps.',
    '3-4 weeks',
    false
);

-- ============================================================================
-- CATEGORY 9: Marketing & Content Creation (5 new ideas - 1 already in DB)
-- ============================================================================

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'AI-Powered Email Newsletter Generator',
    'Generate engaging email newsletter content from minimal inputs. Features include topic research, headline generation, content structuring, call-to-action optimization, and send-time recommendations. Helps creators maintain consistent email communication without the writing burden.',
    'Marketing & Content Creation',
    'Beginner',
    ARRAY['Claude', 'Bolt'],
    ARRAY['email', 'newsletters', 'AI', 'marketing', 'automation'],
    'Freemium with limited generations. Subscription tiers based on volume ($15-50/month). API access for agencies. White-label for email platforms.',
    '2-3 weeks',
    false
);

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Blog Post Outline & Writing Assistant',
    'AI writing assistant that helps bloggers go from idea to published post. Features include outline generation, section drafting, SEO optimization, image suggestions, and readability scoring. Maintains your voice while accelerating content creation.',
    'Marketing & Content Creation',
    'Beginner',
    ARRAY['Claude', 'Bolt'],
    ARRAY['blogging', 'writing', 'AI', 'content', 'SEO'],
    'Freemium with limited posts. Premium unlimited access ($12-30/month). Team plans for content agencies. Integration with publishing platforms.',
    '2-3 weeks',
    false
);

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Video Script Generator from Text',
    'Convert written content into engaging video scripts optimized for different platforms. Features include hook generation, pacing suggestions, B-roll recommendations, call-to-action placement, and platform-specific formatting (YouTube, TikTok, Reels). Helps creators repurpose content for video.',
    'Marketing & Content Creation',
    'Intermediate',
    ARRAY['Claude', 'Google AI Studio'],
    ARRAY['video', 'scripts', 'content-creation', 'social-media', 'repurposing'],
    'Freemium with basic scripts. Premium features and unlimited generation ($15-40/month). API for video production tools. Agency subscriptions.',
    '3-4 weeks',
    false
);

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Podcast Highlight Extractor & Clipper',
    'Automatically identify and extract the most engaging moments from podcast episodes. Features include AI-powered highlight detection, automatic clip generation, audiogram creation, and social media formatting. Helps podcasters maximize content reach with minimal effort.',
    'Marketing & Content Creation',
    'Intermediate',
    ARRAY['Claude', 'Google AI Studio'],
    ARRAY['podcasts', 'clips', 'social-media', 'content', 'AI'],
    'Pay-per-episode or subscription ($20-60/month). API access for podcast hosting platforms. White-label for agencies. Sponsored clip distribution.',
    '4-5 weeks',
    false
);

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'SEO Analysis & Optimization Tool',
    'Comprehensive SEO tool that analyzes content and provides actionable optimization recommendations. Features include keyword research, competitor analysis, on-page SEO scoring, backlink opportunities, and content gap identification. AI-powered suggestions make SEO accessible to non-experts.',
    'Marketing & Content Creation',
    'Advanced',
    ARRAY['Claude', 'Google AI Studio'],
    ARRAY['SEO', 'marketing', 'analytics', 'content', 'optimization'],
    'Freemium with basic analysis. Premium full features ($25-80/month). Agency plans with white-label reports. API access for developers.',
    '5-6 weeks',
    false
);

-- ============================================================================
-- CATEGORY 10: Niche Community Tools (3 new ideas)
-- ============================================================================

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Freelancer Rate Calculator',
    'Help freelancers determine fair pricing for their services based on experience, market rates, location, and project complexity. Features include rate comparison data, project quote builder, value-based pricing suggestions, and negotiation tips. Empowers freelancers to charge their worth.',
    'Niche Community Tools',
    'Beginner',
    ARRAY['Claude', 'Bolt'],
    ARRAY['freelancing', 'pricing', 'calculator', 'business', 'rates'],
    'Freemium calculator with premium market data ($5-15/month). Affiliate partnerships with freelance platforms. Sponsored by freelance tools and services.',
    '2-3 weeks',
    false
);

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Community Fundraising Campaign Manager',
    'All-in-one platform for community-based fundraising campaigns. Features include campaign page builder, donor management, social sharing tools, progress tracking, thank-you automation, and transparent fund distribution tracking. Built for grassroots and mutual aid efforts.',
    'Niche Community Tools',
    'Intermediate',
    ARRAY['Claude', 'Lovable', 'Bolt'],
    ARRAY['fundraising', 'community', 'donations', 'nonprofits', 'campaigns'],
    'Low transaction fees (2-3%). Premium features for larger campaigns. White-label for organizations. Fiscal sponsorship partnerships.',
    '4-5 weeks',
    false
);

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Volunteer Hour Tracker & Recognition System',
    'Track volunteer contributions and celebrate community service with recognition features. Features include hour logging, skill tagging, certificate generation, impact visualization, and gamified achievements. Helps organizations manage volunteers while making contributors feel valued.',
    'Niche Community Tools',
    'Beginner',
    ARRAY['Claude', 'Lovable'],
    ARRAY['volunteering', 'tracking', 'recognition', 'community', 'nonprofits'],
    'Freemium for small organizations. Premium features for larger nonprofits ($10-30/month). Corporate volunteer program licensing. Background check integration fees.',
    '2-3 weeks',
    false
);

-- ============================================================================
-- CATEGORY 11: Personal Productivity & Finance (6 new ideas)
-- ============================================================================

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Expense Tracking & Budget Analyzer',
    'Simple yet powerful expense tracking with AI-powered budget analysis. Features include receipt scanning, automatic categorization, spending pattern insights, budget recommendations, and bill reminders. Helps users understand and improve their financial habits.',
    'Personal Productivity & Finance',
    'Intermediate',
    ARRAY['Claude', 'Lovable'],
    ARRAY['finance', 'budgeting', 'expenses', 'tracking', 'AI'],
    'Freemium with basic tracking. Premium AI insights and features ($8-20/month). Partnerships with financial institutions. Affiliate revenue from recommended services.',
    '3-4 weeks',
    false
);

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Meeting Minutes & Action Items Extractor',
    'Transform meeting recordings or notes into structured summaries with clear action items. Features include speaker identification, decision highlighting, action item assignment, deadline tracking, and follow-up reminders. Never lose track of meeting outcomes again.',
    'Personal Productivity & Finance',
    'Intermediate',
    ARRAY['Claude', 'Google AI Studio'],
    ARRAY['meetings', 'productivity', 'notes', 'action-items', 'AI'],
    'Freemium with limited meetings. Premium unlimited processing ($12-35/month). Team plans for businesses. Integration with calendar and project tools.',
    '3-4 weeks',
    false
);

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Time Tracking & Productivity Dashboard',
    'Comprehensive time tracking with productivity insights and recommendations. Features include automatic activity detection, project time allocation, focus session timer, distraction analysis, and productivity scoring. Helps professionals understand and optimize how they spend their time.',
    'Personal Productivity & Finance',
    'Intermediate',
    ARRAY['Claude', 'Lovable'],
    ARRAY['time-tracking', 'productivity', 'analytics', 'focus', 'dashboard'],
    'Freemium with basic tracking. Premium analytics and team features ($10-30/month). Enterprise licensing. Integration marketplace.',
    '3-4 weeks',
    false
);

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Personal Goal Setting & Progress Tracker',
    'Set meaningful goals and track progress with AI-powered guidance. Features include SMART goal framework, milestone planning, progress visualization, obstacle identification, and motivational check-ins. Helps users achieve both personal and professional objectives.',
    'Personal Productivity & Finance',
    'Beginner',
    ARRAY['Claude', 'Bolt'],
    ARRAY['goals', 'productivity', 'tracking', 'motivation', 'planning'],
    'Freemium with basic goals. Premium unlimited goals and AI coaching ($8-20/month). Corporate goal-setting program licensing. Coach integration platform.',
    '2-3 weeks',
    false
);

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Document Organization & Smart Tagging System',
    'AI-powered document management that automatically organizes, tags, and makes files searchable. Features include content-based categorization, smart folders, duplicate detection, version tracking, and natural language search. Brings order to digital chaos.',
    'Personal Productivity & Finance',
    'Advanced',
    ARRAY['Claude', 'Google AI Studio'],
    ARRAY['documents', 'organization', 'AI', 'productivity', 'search'],
    'Freemium with storage limits. Premium unlimited storage and features ($10-30/month). Business plans with team sharing. Integration with cloud storage providers.',
    '5-6 weeks',
    false
);

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Recurring Task Automation Manager',
    'Automate repetitive tasks and workflows with an easy-to-use automation builder. Features include task templates, scheduling, conditional logic, integration triggers, and execution monitoring. No-code automation for personal and professional workflows.',
    'Personal Productivity & Finance',
    'Intermediate',
    ARRAY['Claude', 'Bolt'],
    ARRAY['automation', 'tasks', 'productivity', 'workflows', 'no-code'],
    'Freemium with limited automations. Premium unlimited ($15-40/month). Team and enterprise plans. Marketplace for automation templates.',
    '4-5 weeks',
    false
);

-- ============================================================================
-- CATEGORY 12: Projects in Development (3 new ideas)
-- ============================================================================

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Community Resilience Planning Toolkit',
    'Help communities prepare for and respond to challenges through collaborative planning tools. Features include risk assessment templates, resource mapping, communication tree builder, scenario planning, and recovery tracking. Empowers communities to build resilience together.',
    'Projects in Development',
    'Advanced',
    ARRAY['Claude', 'Lovable'],
    ARRAY['community', 'resilience', 'planning', 'emergency', 'collaboration'],
    'Free for community use with premium features. Grant funding for implementation. Government and NGO licensing. Consulting services for customization.',
    '6-8 weeks',
    false
);

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Crisis Response Coordination Platform',
    'Coordinate community response during emergencies and crises. Features include volunteer dispatch, resource tracking, needs matching, real-time updates, and post-crisis documentation. Helps communities mobilize quickly and effectively when it matters most.',
    'Projects in Development',
    'Advanced',
    ARRAY['Claude', 'Bolt', 'Lovable'],
    ARRAY['crisis', 'emergency', 'coordination', 'community', 'response'],
    'Free basic access for emergencies. Premium features for ongoing preparedness. Municipal and organizational licensing. Integration with emergency services.',
    '6-8 weeks',
    false
);

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Environmental Justice Advocacy Tool',
    'Platform for tracking, documenting, and advocating around environmental justice issues. Features include pollution mapping, health impact documentation, regulatory tracking, community organizing tools, and report generation. Amplifies community voices in environmental decisions.',
    'Projects in Development',
    'Advanced',
    ARRAY['Claude', 'Google AI Studio'],
    ARRAY['environment', 'justice', 'advocacy', 'community', 'policy'],
    'Free for community advocates. Foundation and grant funding. Research institution partnerships. Legal organization licensing.',
    '6-8 weeks',
    false
);

-- ============================================================================
-- CATEGORY 13: Think Tank & Research (2 new ideas - 1 similar already in DB)
-- ============================================================================

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Research Paper Collaboration Platform',
    'Collaborative platform for academic research teams. Features include shared bibliography management, collaborative writing with version control, peer review workflows, citation formatting, and publication tracking. Makes research collaboration seamless across institutions.',
    'Think Tank & Research',
    'Advanced',
    ARRAY['Claude', 'Google AI Studio'],
    ARRAY['research', 'collaboration', 'academic', 'writing', 'citations'],
    'Freemium for individual researchers. Team subscriptions ($15-50/user/month). Institutional licensing. Publisher integrations.',
    '5-6 weeks',
    false
);

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Africana Policy Brief Generator',
    'AI-assisted tool for creating policy briefs focused on issues affecting African and diaspora communities. Features include research summarization, data visualization, stakeholder mapping, recommendation framing, and distribution tracking. Helps advocates create professional policy documents.',
    'Think Tank & Research',
    'Intermediate',
    ARRAY['Claude', 'Google AI Studio'],
    ARRAY['policy', 'research', 'africana', 'advocacy', 'briefs'],
    'Freemium with basic briefs. Premium features and templates ($20-50/month). Think tank and advocacy organization licensing. Foundation grants for community use.',
    '4-5 weeks',
    false
);

INSERT INTO ideas (
    title, description, category, difficulty, tools, tags,
    monetization_potential, estimated_build_time, free_tier
) VALUES (
    'Debate Framework & Argument Mapper',
    'Visual tool for mapping arguments, counterarguments, and evidence in complex debates. Features include argument tree visualization, evidence linking, strength assessment, and collaborative debate preparation. Perfect for debate teams, policy analysts, and critical thinkers.',
    'Think Tank & Research',
    'Intermediate',
    ARRAY['Claude', 'Lovable'],
    ARRAY['debate', 'arguments', 'critical-thinking', 'research', 'visualization'],
    'Freemium for individual use. Premium team features ($10-25/month). Educational institution licensing. Debate organization partnerships.',
    '3-4 weeks',
    false
);

-- ============================================================================
-- SEED DATA SUMMARY
-- ============================================================================

DO $$
DECLARE
    idea_count INTEGER;
    new_ideas INTEGER;
BEGIN
    SELECT COUNT(*) INTO idea_count FROM ideas;
    new_ideas := idea_count - 10; -- Started with 10 ideas
    RAISE NOTICE 'Migration 015 completed. Added % new ideas. Total ideas in database: %', new_ideas, idea_count;
END $$;
