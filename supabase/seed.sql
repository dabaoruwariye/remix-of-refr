-- ============================================================
-- Refr — Seed Data
-- Run AFTER schema.sql. Paste into Supabase SQL Editor.
-- ============================================================

-- ============================================================
-- USERS — 5 lookers, 5 referrers
-- ============================================================
insert into users (id, email, name, user_type) values
  -- Lookers
  ('11111111-0000-0000-0000-000000000001', 'sarah.chen@gmail.com',      'Sarah Chen',      'looker'),
  ('11111111-0000-0000-0000-000000000002', 'marcus.johnson@gmail.com',   'Marcus Johnson',  'looker'),
  ('11111111-0000-0000-0000-000000000003', 'priya.kapoor@gmail.com',     'Priya Kapoor',    'looker'),
  ('11111111-0000-0000-0000-000000000004', 'david.park@gmail.com',       'David Park',      'looker'),
  ('11111111-0000-0000-0000-000000000005', 'aisha.patel@gmail.com',      'Aisha Patel',     'looker'),
  -- Referrers
  ('22222222-0000-0000-0000-000000000001', 'jordan.riley@gmail.com',     'Jordan Riley',    'referrer'),
  ('22222222-0000-0000-0000-000000000002', 'taylor.nguyen@gmail.com',    'Taylor Nguyen',   'referrer'),
  ('22222222-0000-0000-0000-000000000003', 'alex.morrison@gmail.com',    'Alex Morrison',   'referrer'),
  ('22222222-0000-0000-0000-000000000004', 'morgan.lee@gmail.com',       'Morgan Lee',      'referrer'),
  ('22222222-0000-0000-0000-000000000005', 'casey.oduya@gmail.com',      'Casey Oduya',     'referrer');

-- ============================================================
-- LOOKER PROFILES
-- ============================================================
insert into looker_profiles (user_id, target_role, seniority, industries, visible) values
  ('11111111-0000-0000-0000-000000000001', 'Product Manager',       'senior',    array['Technology', 'Finance'],              true),
  ('11111111-0000-0000-0000-000000000002', 'Engineering Manager',   'lead',      array['Technology', 'Consumer'],             true),
  ('11111111-0000-0000-0000-000000000003', 'Head of Design',        'senior',    array['Technology', 'Healthcare'],           true),
  ('11111111-0000-0000-0000-000000000004', 'Head of Growth',        'senior',    array['Technology', 'Consumer', 'Media'],    true),
  ('11111111-0000-0000-0000-000000000005', 'ML Engineering Lead',   'senior',    array['Technology'],                         false);

-- ============================================================
-- REFERRER PROFILES
-- ============================================================
insert into referrer_profiles (user_id, industries, network_description) values
  ('22222222-0000-0000-0000-000000000001', array['Technology', 'Finance'],
   'Former Stripe engineering lead. Strong network across fintech and developer tools.'),
  ('22222222-0000-0000-0000-000000000002', array['Technology', 'Healthcare'],
   'Product leader at Figma. Deep connections across product orgs at Series B–D startups.'),
  ('22222222-0000-0000-0000-000000000003', array['Technology', 'Consumer'],
   'Spent a decade at Meta and Airbnb. Well connected across growth and data engineering.'),
  ('22222222-0000-0000-0000-000000000004', array['Technology', 'Finance', 'Media'],
   'Investor at Sequoia. See hundreds of hiring rolls across the portfolio each quarter.'),
  ('22222222-0000-0000-0000-000000000005', array['Technology', 'Healthcare'],
   'Head of Talent at Anthropic. Runs hiring for research, product, and engineering teams.');

-- ============================================================
-- WORK HISTORY — Lookers
-- ============================================================
insert into work_history (user_id, company_name, job_title, start_date, end_date, description) values
  -- Sarah Chen
  ('11111111-0000-0000-0000-000000000001', 'Stripe',  'Senior Product Manager',   '2019-06', '2022-08',
   'Led Billing v3 platform, shipping a full redesign of invoicing and subscription flows to 200K+ merchants.'),
  ('11111111-0000-0000-0000-000000000001', 'Brex',    'Product Manager',          '2017-03', '2019-05',
   'Owned the expense management product from zero to 10K active business customers.'),

  -- Marcus Johnson
  ('11111111-0000-0000-0000-000000000002', 'Meta',    'Engineering Manager',      '2018-01', '2023-06',
   'Managed a 40-person org building developer tooling for internal platform teams.'),
  ('11111111-0000-0000-0000-000000000002', 'Google',  'Software Engineer III',    '2015-08', '2017-12',
   'Backend infrastructure for Google Drive, focused on file storage at petabyte scale.'),

  -- Priya Kapoor
  ('11111111-0000-0000-0000-000000000003', 'Figma',   'Senior Product Designer',  '2020-04', '2023-10',
   'Designed the core collaborative canvas experience and led redesign of the component library.'),
  ('11111111-0000-0000-0000-000000000003', 'IDEO',    'UX Designer',              '2017-09', '2020-03',
   'Human-centered design work across healthcare and consumer product clients.'),

  -- David Park
  ('11111111-0000-0000-0000-000000000004', 'Notion',  'Growth Lead',              '2020-09', '2023-12',
   'Scaled PLG motion from Series A through Series C. Drove user activation improvements of 34%.'),
  ('11111111-0000-0000-0000-000000000004', 'Duolingo','Growth PM',                '2018-06', '2020-08',
   'Owned referral and push notification channels, contributing to 2× DAU growth in 18 months.'),

  -- Aisha Patel
  ('11111111-0000-0000-0000-000000000005', 'Airbnb',  'ML Engineer',             '2019-02', '2023-11',
   'Built the personalization ML pipeline powering search ranking and recommendation systems.'),
  ('11111111-0000-0000-0000-000000000005', 'Twitter', 'Software Engineer',        '2016-07', '2019-01',
   'Worked on the relevance team, contributing to tweet ranking and timeline quality models.');

-- ============================================================
-- WORK HISTORY — Referrers
-- ============================================================
insert into work_history (user_id, company_name, job_title, start_date, end_date, description) values
  -- Jordan Riley
  ('22222222-0000-0000-0000-000000000001', 'Stripe',  'Engineering Lead',         '2018-03', '2022-09',
   'Led the Payments infrastructure team, overseeing a team of 12 engineers.'),
  ('22222222-0000-0000-0000-000000000001', 'Plaid',   'Senior Software Engineer', '2015-06', '2018-02',
   'Core banking integrations and developer API design.'),

  -- Taylor Nguyen
  ('22222222-0000-0000-0000-000000000002', 'Figma',   'Director of Product',      '2020-01', null,
   'Leading product strategy across the editor and collaboration surfaces.'),
  ('22222222-0000-0000-0000-000000000002', 'Dropbox', 'Senior PM',               '2017-04', '2019-12',
   'Owned Paper and the core file sync experience on mobile.'),

  -- Alex Morrison
  ('22222222-0000-0000-0000-000000000003', 'Airbnb',  'Head of Data Engineering', '2017-09', '2023-04',
   'Built and managed the data platform serving product analytics across all of Airbnb.'),
  ('22222222-0000-0000-0000-000000000003', 'Meta',    'Data Engineer',            '2014-06', '2017-08',
   'Worked on the Analytics Infrastructure team supporting ads measurement.'),

  -- Morgan Lee
  ('22222222-0000-0000-0000-000000000004', 'Sequoia Capital', 'Partner',         '2020-06', null,
   'Early-stage consumer and enterprise SaaS investments. Board seats at 6 portfolio companies.'),
  ('22222222-0000-0000-0000-000000000004', 'Benchmark',      'Associate',        '2017-01', '2020-05',
   'Sourcing and diligence across fintech and developer tools.'),

  -- Casey Oduya
  ('22222222-0000-0000-0000-000000000005', 'Anthropic', 'Head of Talent',        '2022-06', null,
   'Built recruiting function from 80 to 400 employees, covering research, policy, and engineering.'),
  ('22222222-0000-0000-0000-000000000005', 'OpenAI',    'Senior Recruiter',      '2019-03', '2022-05',
   'Technical recruiting for the safety and alignment research teams.');

-- ============================================================
-- EDUCATION — Lookers
-- ============================================================
insert into education (user_id, school_name, degree_type, field_of_study, graduation_year) values
  ('11111111-0000-0000-0000-000000000001', 'Stanford University',         'BS',  'Computer Science',          '2017'),
  ('11111111-0000-0000-0000-000000000002', 'Stanford University',         'BS',  'Computer Science',          '2015'),
  ('11111111-0000-0000-0000-000000000002', 'Carnegie Mellon University',  'MS',  'Software Engineering',      '2016'),
  ('11111111-0000-0000-0000-000000000003', 'Rhode Island School of Design','BFA', 'Industrial Design',         '2017'),
  ('11111111-0000-0000-0000-000000000003', 'Stanford University',         'MA',  'Design',                    '2019'),
  ('11111111-0000-0000-0000-000000000004', 'Harvard Business School',     'MBA', 'Business Administration',   '2018'),
  ('11111111-0000-0000-0000-000000000004', 'UC Berkeley',                 'BS',  'Cognitive Science',         '2015'),
  ('11111111-0000-0000-0000-000000000005', 'MIT',                         'BS',  'Electrical Engineering',    '2016'),
  ('11111111-0000-0000-0000-000000000005', 'MIT',                         'MS',  'Machine Learning',          '2017');

-- ============================================================
-- EDUCATION — Referrers
-- ============================================================
insert into education (user_id, school_name, degree_type, field_of_study, graduation_year) values
  ('22222222-0000-0000-0000-000000000001', 'Stanford University',         'BS',  'Computer Science',          '2015'),
  ('22222222-0000-0000-0000-000000000002', 'MIT',                         'BS',  'Computer Science',          '2016'),
  ('22222222-0000-0000-0000-000000000002', 'Stanford University',         'MBA', 'Business Administration',   '2020'),
  ('22222222-0000-0000-0000-000000000003', 'University of Michigan',      'BS',  'Computer Science',          '2014'),
  ('22222222-0000-0000-0000-000000000004', 'Princeton University',        'AB',  'Economics',                 '2014'),
  ('22222222-0000-0000-0000-000000000004', 'Harvard Business School',     'MBA', 'Business Administration',   '2017'),
  ('22222222-0000-0000-0000-000000000005', 'Howard University',           'BS',  'Psychology',                '2015'),
  ('22222222-0000-0000-0000-000000000005', 'Columbia University',         'MA',  'Organizational Psychology', '2017');

-- ============================================================
-- RELATIONSHIPS — confirmed, with context
-- ============================================================
insert into relationships (referrer_id, looker_id, context, overlap_company, overlap_school, confirmed_by_looker) values
  -- Jordan Riley worked with Sarah Chen at Stripe
  ('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001',
   'worked_together', 'Stripe', null, true),

  -- Jordan Riley and Marcus Johnson went to Stanford together
  ('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002',
   'same_school', null, 'Stanford University', true),

  -- Alex Morrison worked with Aisha Patel (both at Airbnb / Meta overlap)
  ('22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000005',
   'worked_together', 'Airbnb', null, true),

  -- Taylor Nguyen worked with Priya Kapoor at Figma
  ('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000003',
   'worked_together', 'Figma', null, true),

  -- Morgan Lee knows David Park through professional community (HBS)
  ('22222222-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000004',
   'same_school', null, 'Harvard Business School', false);

-- ============================================================
-- REFERRALS — three referrals in different statuses
-- ============================================================
insert into referrals (referrer_id, looker_id, company_name, role_signal, hiring_manager_email, vouch_text, email_body, status) values
  -- Jordan → Sarah → Anthropic (in_process)
  ('22222222-0000-0000-0000-000000000001',
   '11111111-0000-0000-0000-000000000001',
   'Anthropic',
   'VP of Product',
   'jordan@anthropic.com',
   'Sarah is the most rigorous PM I''ve worked with. She shipped Billing v3 at Stripe with almost zero escalations and brought a level of technical depth to product work that is genuinely rare.',
   'Hi — I wanted to introduce you to Sarah Chen. Sarah was the PM lead on our Billing v3 platform at Stripe. She shipped a complete redesign of invoicing and subscription flows to 200K+ merchants on time and under budget. She''s deeply technical, calm under pressure, and has an exceptional ability to align engineering and business goals. I think she''d be a phenomenal fit for the VP Product role at Anthropic. Happy to share more context.',
   'in_process'),

  -- Alex → Aisha → OpenAI (hired)
  ('22222222-0000-0000-0000-000000000003',
   '11111111-0000-0000-0000-000000000005',
   'OpenAI',
   'ML Engineering Lead',
   'talent@openai.com',
   'Aisha built the personalization ML pipeline that defines Airbnb''s search ranking today. She''s one of the most capable ML engineers I''ve worked alongside — strong systems instincts and excellent technical judgment.',
   'Hi — I''d like to recommend Aisha Patel for the ML Engineering Lead position. Aisha built the personalization ML pipeline at Airbnb that improved search conversion by 12% and now runs at millions of requests per day. She''s deeply skilled in recommendation systems, production ML infrastructure, and has the communication skills to lead a technical team. I think she''d be an exceptional fit.',
   'hired'),

  -- Taylor → Priya → Linear (sent)
  ('22222222-0000-0000-0000-000000000002',
   '11111111-0000-0000-0000-000000000003',
   'Linear',
   'Head of Design',
   'hiring@linear.app',
   'Priya redesigned Figma''s collaborative canvas experience while managing a team of four designers. Her craft is exceptional and she has strong product instincts — rare for a design leader.',
   'Hi — I wanted to introduce Priya Kapoor. Priya led design on Figma''s core editor experience and spearheaded a full redesign of the component library used by millions of developers. She has a rare combination of high craft, deep product thinking, and leadership experience. Linear feels like exactly the kind of product-led company where she''d do her best work. Happy to share more.',
   'sent');
