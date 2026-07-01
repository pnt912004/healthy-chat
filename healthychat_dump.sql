--
-- PostgreSQL database dump
--

\restrict cyTEbgMGVQ4KwNNhufmQGFSl1vXOxkFQIy8NUKqeqEfvdf2gMF70ax87dMozDlN

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
-- Name: goals id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goals ALTER COLUMN id SET DEFAULT nextval('public.goals_id_seq'::regclass);


--
-- Name: health_tips id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_tips ALTER COLUMN id SET DEFAULT nextval('public.health_tips_id_seq'::regclass);


--
-- Name: nutrition_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nutrition_logs ALTER COLUMN id SET DEFAULT nextval('public.nutrition_logs_id_seq'::regclass);


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
-- Name: nutrition_logs nutrition_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nutrition_logs
    ADD CONSTRAINT nutrition_logs_pkey PRIMARY KEY (id);


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
-- Name: ix_goals_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_goals_user_id ON public.goals USING btree (user_id);


--
-- Name: ix_health_tips_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_health_tips_category ON public.health_tips USING btree (category);


--
-- Name: ix_nutrition_logs_logged_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_nutrition_logs_logged_at ON public.nutrition_logs USING btree (logged_at);


--
-- Name: ix_nutrition_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_nutrition_logs_user_id ON public.nutrition_logs USING btree (user_id);


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
-- Name: goals goals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: nutrition_logs nutrition_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nutrition_logs
    ADD CONSTRAINT nutrition_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: water_logs water_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.water_logs
    ADD CONSTRAINT water_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict cyTEbgMGVQ4KwNNhufmQGFSl1vXOxkFQIy8NUKqeqEfvdf2gMF70ax87dMozDlN

