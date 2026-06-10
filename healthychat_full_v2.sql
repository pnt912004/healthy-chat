--
-- PostgreSQL database dump
--

\restrict UdM8qykLrRvICuEM3izOfnRCRgRwZUd1e57lJRdSDP8VB2SlcYjgTAYJPZVUMcH

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_messages (
    id integer NOT NULL,
    user_id integer NOT NULL,
    session_id character varying(100) NOT NULL,
    role character varying(10) NOT NULL,
    content character varying NOT NULL,
    analysis json,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: chat_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chat_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chat_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.chat_messages_id_seq OWNED BY public.chat_messages.id;


--
-- Name: exercise_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exercise_logs (
    id integer NOT NULL,
    user_id integer NOT NULL,
    exercise_type character varying(100) NOT NULL,
    duration_minutes integer NOT NULL,
    intensity character varying(50) NOT NULL,
    calories_burned double precision NOT NULL,
    notes character varying,
    logged_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: exercise_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.exercise_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: exercise_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.exercise_logs_id_seq OWNED BY public.exercise_logs.id;


--
-- Name: favorite_foods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.favorite_foods (
    id integer NOT NULL,
    user_id integer NOT NULL,
    food_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: favorite_foods_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.favorite_foods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: favorite_foods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.favorite_foods_id_seq OWNED BY public.favorite_foods.id;


--
-- Name: foods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.foods (
    id integer NOT NULL,
    name character varying NOT NULL,
    name_en character varying,
    category character varying,
    calories_per_100g double precision NOT NULL,
    protein_per_100g double precision NOT NULL,
    carbs_per_100g double precision NOT NULL,
    fat_per_100g double precision NOT NULL,
    fiber_per_100g double precision,
    default_portion_g double precision NOT NULL,
    portion_label character varying,
    is_verified boolean NOT NULL,
    source character varying,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: foods_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.foods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: foods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.foods_id_seq OWNED BY public.foods.id;


--
-- Name: goals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.goals (
    id integer NOT NULL,
    user_id integer NOT NULL,
    current_weight double precision,
    height double precision,
    age integer,
    gender character varying,
    activity_level character varying,
    target_weight double precision,
    bmr double precision,
    tdee double precision,
    bmi double precision,
    daily_calorie_goal double precision,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: goals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.goals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: goals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.goals_id_seq OWNED BY public.goals.id;


--
-- Name: health_tips; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.health_tips (
    id integer NOT NULL,
    category character varying(50) NOT NULL,
    content character varying NOT NULL,
    icon character varying(50),
    created_at timestamp without time zone NOT NULL
);


--
-- Name: health_tips_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.health_tips_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: health_tips_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.health_tips_id_seq OWNED BY public.health_tips.id;


--
-- Name: mood_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mood_logs (
    id integer NOT NULL,
    user_id integer NOT NULL,
    mood character varying(50) NOT NULL,
    energy_level integer NOT NULL,
    tags jsonb,
    notes character varying,
    logged_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: mood_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mood_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mood_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mood_logs_id_seq OWNED BY public.mood_logs.id;


--
-- Name: notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification (
    id integer NOT NULL,
    user_id integer NOT NULL,
    type character varying NOT NULL,
    title character varying NOT NULL,
    content character varying NOT NULL,
    is_read boolean NOT NULL,
    action_url character varying,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: notification_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notification_id_seq OWNED BY public.notification.id;


--
-- Name: nutrition_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nutrition_logs (
    id integer NOT NULL,
    user_id integer NOT NULL,
    food_name character varying(200) NOT NULL,
    calories double precision NOT NULL,
    protein double precision,
    carbs double precision,
    fat double precision,
    portion character varying(100),
    meal_type character varying(20) NOT NULL,
    logged_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: nutrition_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.nutrition_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: nutrition_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.nutrition_logs_id_seq OWNED BY public.nutrition_logs.id;


--
-- Name: remindersetting; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.remindersetting (
    id integer NOT NULL,
    user_id integer NOT NULL,
    water_reminder boolean NOT NULL,
    water_interval_hours integer NOT NULL,
    meal_reminder boolean NOT NULL,
    exercise_reminder boolean NOT NULL,
    weekly_report boolean NOT NULL,
    quiet_hours_start character varying NOT NULL,
    quiet_hours_end character varying NOT NULL
);


--
-- Name: remindersetting_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.remindersetting_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: remindersetting_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.remindersetting_id_seq OWNED BY public.remindersetting.id;


--
-- Name: sleep_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sleep_logs (
    id integer NOT NULL,
    user_id integer NOT NULL,
    sleep_time timestamp without time zone NOT NULL,
    wake_time timestamp without time zone NOT NULL,
    duration_hours double precision NOT NULL,
    quality integer NOT NULL,
    notes character varying,
    logged_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: sleep_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sleep_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sleep_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sleep_logs_id_seq OWNED BY public.sleep_logs.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(20),
    hashed_password character varying NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    avatar_url character varying,
    role character varying(20) NOT NULL,
    is_active boolean NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: water_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.water_logs (
    id integer NOT NULL,
    user_id integer NOT NULL,
    amount_ml integer NOT NULL,
    logged_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: water_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.water_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: water_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.water_logs_id_seq OWNED BY public.water_logs.id;


--
-- Name: chat_messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages ALTER COLUMN id SET DEFAULT nextval('public.chat_messages_id_seq'::regclass);


--
-- Name: exercise_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercise_logs ALTER COLUMN id SET DEFAULT nextval('public.exercise_logs_id_seq'::regclass);


--
-- Name: favorite_foods id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorite_foods ALTER COLUMN id SET DEFAULT nextval('public.favorite_foods_id_seq'::regclass);


--
-- Name: foods id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.foods ALTER COLUMN id SET DEFAULT nextval('public.foods_id_seq'::regclass);


--
-- Name: goals id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goals ALTER COLUMN id SET DEFAULT nextval('public.goals_id_seq'::regclass);


--
-- Name: health_tips id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_tips ALTER COLUMN id SET DEFAULT nextval('public.health_tips_id_seq'::regclass);


--
-- Name: mood_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mood_logs ALTER COLUMN id SET DEFAULT nextval('public.mood_logs_id_seq'::regclass);


--
-- Name: notification id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification ALTER COLUMN id SET DEFAULT nextval('public.notification_id_seq'::regclass);


--
-- Name: nutrition_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nutrition_logs ALTER COLUMN id SET DEFAULT nextval('public.nutrition_logs_id_seq'::regclass);


--
-- Name: remindersetting id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.remindersetting ALTER COLUMN id SET DEFAULT nextval('public.remindersetting_id_seq'::regclass);


--
-- Name: sleep_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sleep_logs ALTER COLUMN id SET DEFAULT nextval('public.sleep_logs_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: water_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.water_logs ALTER COLUMN id SET DEFAULT nextval('public.water_logs_id_seq'::regclass);


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
-- Data for Name: favorite_foods; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.favorite_foods (id, user_id, food_id, created_at) FROM stdin;
\.


--
-- Data for Name: foods; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.foods (id, name, name_en, category, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, default_portion_g, portion_label, is_verified, source, created_at) FROM stdin;
1	Cơm trắng	White rice	Cơm/Xôi	130	2.7	28	0.3	0.4	200	1 bát	t	system	2026-06-10 07:18:13.812646
2	Cơm tấm	Broken rice	Cơm/Xôi	145	3	30	1	0.5	250	1 đĩa	t	system	2026-06-10 07:18:13.813327
3	Phở bò	Beef pho	Phở/Bún/Mì	85	4	12	2.5	0.5	450	1 tô	t	system	2026-06-10 07:18:13.813642
4	Bún chả	Bun cha	Phở/Bún/Mì	120	5	15	4	1	300	1 suất	t	system	2026-06-10 07:18:13.814592
5	Bún bò Huế	Bun bo Hue	Phở/Bún/Mì	90	4.5	10	3.5	0.8	450	1 tô	t	system	2026-06-10 07:18:13.815237
6	Mì tôm	Instant noodles	Phở/Bún/Mì	450	9	60	18	2	75	1 gói	t	system	2026-06-10 07:18:13.815636
7	Thịt lợn luộc	Boiled pork	Thịt/Cá/Hải sản	242	27	0	14	0	100	100g	t	system	2026-06-10 07:18:13.815887
8	Thịt gà luộc	Boiled chicken	Thịt/Cá/Hải sản	165	31	0	3.6	0	100	100g	t	system	2026-06-10 07:18:13.816125
9	Cá hồi nướng	Grilled salmon	Thịt/Cá/Hải sản	206	22	0	13	0	150	1 miếng	t	system	2026-06-10 07:18:13.816392
10	Trứng luộc	Boiled egg	Thịt/Cá/Hải sản	155	13	1.1	11	0	50	1 quả	t	system	2026-06-10 07:18:13.816632
11	Đậu phụ	Tofu	Thịt/Cá/Hải sản	76	8	1.9	4.8	0.3	150	1 miếng	t	system	2026-06-10 07:18:13.816948
12	Rau muống xào tỏi	Stir-fried water spinach with garlic	Rau Củ	60	2.5	4	4	2	150	1 đĩa	t	system	2026-06-10 07:18:13.817208
13	Rau bắp cải luộc	Boiled cabbage	Rau Củ	25	1.3	5.8	0.1	2.5	150	1 đĩa	t	system	2026-06-10 07:18:13.817456
14	Cà chua	Tomato	Rau Củ	18	0.9	3.9	0.2	1.2	100	1 quả	t	system	2026-06-10 07:18:13.817717
15	Chuối	Banana	Trái Cây	89	1.1	22.8	0.3	2.6	120	1 quả	t	system	2026-06-10 07:18:13.817967
16	Táo	Apple	Trái Cây	52	0.3	13.8	0.2	2.4	150	1 quả	t	system	2026-06-10 07:18:13.818187
17	Dưa hấu	Watermelon	Trái Cây	30	0.6	7.6	0.2	0.4	200	1 miếng	t	system	2026-06-10 07:18:13.818441
18	Cà phê sữa đá	Iced milk coffee	Đồ Uống	70	1.5	12	1.8	0	250	1 ly	t	system	2026-06-10 07:18:13.818684
19	Trà sữa trân châu	Bubble tea	Đồ Uống	85	0.5	16	2.5	0.2	500	1 ly size M	t	system	2026-06-10 07:18:13.818915
20	Bánh mì pate thịt	Banh mi with pate and pork	Bánh/Snack	250	10	28	11	2	200	1 ổ	t	system	2026-06-10 07:18:13.819186
21	Bánh bao nhân thịt	Steamed pork bun	Bánh/Snack	220	7	32	6	1	150	1 cái	t	system	2026-06-10 07:18:13.819482
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
-- Data for Name: mood_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mood_logs (id, user_id, mood, energy_level, tags, notes, logged_at, created_at) FROM stdin;
\.


--
-- Data for Name: notification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notification (id, user_id, type, title, content, is_read, action_url, created_at) FROM stdin;
\.


--
-- Data for Name: nutrition_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.nutrition_logs (id, user_id, food_name, calories, protein, carbs, fat, portion, meal_type, logged_at, created_at) FROM stdin;
\.


--
-- Data for Name: remindersetting; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.remindersetting (id, user_id, water_reminder, water_interval_hours, meal_reminder, exercise_reminder, weekly_report, quiet_hours_start, quiet_hours_end) FROM stdin;
\.


--
-- Data for Name: sleep_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sleep_logs (id, user_id, sleep_time, wake_time, duration_hours, quality, notes, logged_at, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, email, phone, hashed_password, first_name, last_name, avatar_url, role, is_active, created_at, updated_at) FROM stdin;
1	admin	admin@healthychat.com	\N	$2b$12$O51Fi/4BwNzrEd3Ti7/BteqRORzYDn7bgumGdk3GJfDvuz9UOxaGW	Super	Admin	\N	admin	t	2026-05-24 17:34:44.518856	2026-05-24 17:34:44.518884
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
-- Name: favorite_foods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.favorite_foods_id_seq', 1, false);


--
-- Name: foods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.foods_id_seq', 21, true);


--
-- Name: goals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.goals_id_seq', 1, false);


--
-- Name: health_tips_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.health_tips_id_seq', 5, true);


--
-- Name: mood_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mood_logs_id_seq', 1, false);


--
-- Name: notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notification_id_seq', 1, false);


--
-- Name: nutrition_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.nutrition_logs_id_seq', 1, false);


--
-- Name: remindersetting_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.remindersetting_id_seq', 1, false);


--
-- Name: sleep_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sleep_logs_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: water_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.water_logs_id_seq', 1, false);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: exercise_logs exercise_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercise_logs
    ADD CONSTRAINT exercise_logs_pkey PRIMARY KEY (id);


--
-- Name: favorite_foods favorite_foods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorite_foods
    ADD CONSTRAINT favorite_foods_pkey PRIMARY KEY (id);


--
-- Name: foods foods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.foods
    ADD CONSTRAINT foods_pkey PRIMARY KEY (id);


--
-- Name: goals goals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_pkey PRIMARY KEY (id);


--
-- Name: health_tips health_tips_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_tips
    ADD CONSTRAINT health_tips_pkey PRIMARY KEY (id);


--
-- Name: mood_logs mood_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mood_logs
    ADD CONSTRAINT mood_logs_pkey PRIMARY KEY (id);


--
-- Name: notification notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_pkey PRIMARY KEY (id);


--
-- Name: nutrition_logs nutrition_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nutrition_logs
    ADD CONSTRAINT nutrition_logs_pkey PRIMARY KEY (id);


--
-- Name: remindersetting remindersetting_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.remindersetting
    ADD CONSTRAINT remindersetting_pkey PRIMARY KEY (id);


--
-- Name: remindersetting remindersetting_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.remindersetting
    ADD CONSTRAINT remindersetting_user_id_key UNIQUE (user_id);


--
-- Name: sleep_logs sleep_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sleep_logs
    ADD CONSTRAINT sleep_logs_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: water_logs water_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.water_logs
    ADD CONSTRAINT water_logs_pkey PRIMARY KEY (id);


--
-- Name: ix_chat_messages_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_chat_messages_created_at ON public.chat_messages USING btree (created_at);


--
-- Name: ix_chat_messages_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_chat_messages_session_id ON public.chat_messages USING btree (session_id);


--
-- Name: ix_chat_messages_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_chat_messages_user_id ON public.chat_messages USING btree (user_id);


--
-- Name: ix_exercise_logs_logged_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_exercise_logs_logged_at ON public.exercise_logs USING btree (logged_at);


--
-- Name: ix_exercise_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_exercise_logs_user_id ON public.exercise_logs USING btree (user_id);


--
-- Name: ix_favorite_foods_food_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_favorite_foods_food_id ON public.favorite_foods USING btree (food_id);


--
-- Name: ix_favorite_foods_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_favorite_foods_user_id ON public.favorite_foods USING btree (user_id);


--
-- Name: ix_foods_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_foods_category ON public.foods USING btree (category);


--
-- Name: ix_foods_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_foods_name ON public.foods USING btree (name);


--
-- Name: ix_goals_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_goals_user_id ON public.goals USING btree (user_id);


--
-- Name: ix_health_tips_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_health_tips_category ON public.health_tips USING btree (category);


--
-- Name: ix_mood_logs_logged_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_mood_logs_logged_at ON public.mood_logs USING btree (logged_at);


--
-- Name: ix_mood_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_mood_logs_user_id ON public.mood_logs USING btree (user_id);


--
-- Name: ix_nutrition_logs_logged_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_nutrition_logs_logged_at ON public.nutrition_logs USING btree (logged_at);


--
-- Name: ix_nutrition_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_nutrition_logs_user_id ON public.nutrition_logs USING btree (user_id);


--
-- Name: ix_sleep_logs_logged_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_sleep_logs_logged_at ON public.sleep_logs USING btree (logged_at);


--
-- Name: ix_sleep_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_sleep_logs_user_id ON public.sleep_logs USING btree (user_id);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_username; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_users_username ON public.users USING btree (username);


--
-- Name: ix_water_logs_logged_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_water_logs_logged_at ON public.water_logs USING btree (logged_at);


--
-- Name: ix_water_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_water_logs_user_id ON public.water_logs USING btree (user_id);


--
-- Name: chat_messages chat_messages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: exercise_logs exercise_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercise_logs
    ADD CONSTRAINT exercise_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: favorite_foods favorite_foods_food_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorite_foods
    ADD CONSTRAINT favorite_foods_food_id_fkey FOREIGN KEY (food_id) REFERENCES public.foods(id);


--
-- Name: favorite_foods favorite_foods_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorite_foods
    ADD CONSTRAINT favorite_foods_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: goals goals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: mood_logs mood_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mood_logs
    ADD CONSTRAINT mood_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: notification notification_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: nutrition_logs nutrition_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nutrition_logs
    ADD CONSTRAINT nutrition_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: remindersetting remindersetting_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.remindersetting
    ADD CONSTRAINT remindersetting_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: sleep_logs sleep_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sleep_logs
    ADD CONSTRAINT sleep_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: water_logs water_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.water_logs
    ADD CONSTRAINT water_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict UdM8qykLrRvICuEM3izOfnRCRgRwZUd1e57lJRdSDP8VB2SlcYjgTAYJPZVUMcH

