--
-- PostgreSQL database dump
--

\restrict cbHREajSn4MoXE7lJ0uxzff2CPq1CD8q41brpjJSWAPFPVM7qce2Y8BkfKd99Ff

-- Dumped from database version 15.18
-- Dumped by pg_dump version 15.18

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, email, phone, hashed_password, first_name, last_name, avatar_url, role, is_active, created_at, updated_at) FROM stdin;
1	admin	admin@healthychat.com	\N	$2b$12$O51Fi/4BwNzrEd3Ti7/BteqRORzYDn7bgumGdk3GJfDvuz9UOxaGW	Super	Admin	\N	admin	t	2026-05-24 17:34:44.518856	2026-05-24 17:34:44.518884
\.


--
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_messages (id, user_id, session_id, role, content, analysis, created_at) FROM stdin;
\.


--
-- Data for Name: exercise_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.exercise_logs (id, user_id, exercise_type, duration_minutes, intensity, calories_burned, notes, logged_at, created_at) FROM stdin;
\.


--
-- Data for Name: goals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.goals (id, user_id, current_weight, height, age, gender, activity_level, target_weight, bmr, tdee, bmi, daily_calorie_goal, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: health_tips; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.health_tips (id, category, content, icon, created_at) FROM stdin;
1	Dinh dưỡng	Đi bộ 10 phút sau bữa ăn giúp điều hoà đường huyết và cải thiện tiêu hoá đáng kể.	restaurant	2026-05-24 17:34:44.531077
2	Nước	Uống một ly nước ngay sau khi thức dậy giúp kích hoạt các cơ quan nội tạng và bù nước cho cơ thể.	water_drop	2026-05-24 17:34:44.531277
3	Giấc ngủ	Hạn chế sử dụng thiết bị điện tử 30 phút trước khi ngủ để cải thiện chất lượng giấc ngủ.	bedtime	2026-05-24 17:34:44.531396
4	Vận động	Đứng dậy và vươn vai mỗi 45 phút làm việc giúp giảm căng thẳng cho cột sống và mắt.	fitness_center	2026-05-24 17:34:44.531489
5	Tâm lý	Dành 5 phút thiền định mỗi sáng giúp bạn giữ bình tĩnh và tập trung tốt hơn trong cả ngày.	psychology	2026-05-24 17:34:44.531565
\.


--
-- Data for Name: nutrition_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.nutrition_logs (id, user_id, food_name, calories, protein, carbs, fat, portion, meal_type, logged_at, created_at) FROM stdin;
\.


--
-- Data for Name: water_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.water_logs (id, user_id, amount_ml, logged_at, created_at) FROM stdin;
\.


--
-- Name: chat_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.chat_messages_id_seq', 1, false);


--
-- Name: exercise_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.exercise_logs_id_seq', 1, false);


--
-- Name: goals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.goals_id_seq', 1, false);


--
-- Name: health_tips_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.health_tips_id_seq', 5, true);


--
-- Name: nutrition_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.nutrition_logs_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: water_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.water_logs_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--

\unrestrict cbHREajSn4MoXE7lJ0uxzff2CPq1CD8q41brpjJSWAPFPVM7qce2Y8BkfKd99Ff

